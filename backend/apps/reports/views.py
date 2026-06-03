import csv
import io
import json
from datetime import timedelta

from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditLog
from apps.audit.services import log_audit_event
from apps.complaints.models import Complaint
from apps.stages.models import Stage
from apps.students.models import Student
from apps.users.models import User


ADMIN_REPORT_ROLES = ['coordinator', 'dean', 'cod', 'director_bps']
EXPORT_REPORT_TYPES = ['students', 'users', 'supervisors', 'complaints']
EXPORT_FORMATS = ['csv', 'pdf']


class IsReportAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role_key in ADMIN_REPORT_ROLES
        )


class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [IsReportAdmin()]

    def _parse_date(self, value, end_of_day=False):
        if not value:
            return None
        parsed = timezone.datetime.fromisoformat(value)
        if len(value) == 10:
            time_args = {'hour': 23, 'minute': 59, 'second': 59, 'microsecond': 999999} if end_of_day else {
                'hour': 0, 'minute': 0, 'second': 0, 'microsecond': 0}
            parsed = parsed.replace(**time_args)
        if timezone.is_naive(parsed):
            parsed = timezone.make_aware(parsed)
        return parsed

    def _get_date_window(self, request):
        range_type = request.query_params.get('range')
        if range_type == 'day':
            return timezone.now() - timedelta(days=1)
        if range_type == 'week':
            return timezone.now() - timedelta(days=7)
        if range_type == 'month':
            return timezone.now() - timedelta(days=30)

        start = request.query_params.get('from')
        end = request.query_params.get('to')
        if start:
            start_dt = timezone.datetime.fromisoformat(start)
            if timezone.is_naive(start_dt):
                start_dt = timezone.make_aware(start_dt)
            return start_dt
        if end:
            end_dt = timezone.datetime.fromisoformat(end)
            if timezone.is_naive(end_dt):
                end_dt = timezone.make_aware(end_dt)
            return end_dt - timedelta(days=30)
        return None

    def _filter_queryset_by_date(self, queryset, field_name, request):
        start_date = self._get_date_window(request)
        end_date = self._parse_date(
            request.query_params.get('to'), end_of_day=True)
        if start_date:
            queryset = queryset.filter(**{f'{field_name}__gte': start_date})
        if end_date:
            queryset = queryset.filter(**{f'{field_name}__lte': end_date})
        return queryset

    def _student_report_payload(self, request):
        students = Student.objects.select_related(
            'user', 'assigned_supervisor').prefetch_related(
            'stages', 'stages__activities')
        stages = Stage.objects.select_related('student__user', 'approved_by')

        stages = self._filter_queryset_by_date(stages, 'started_at', request)

        current_stage_groups = {
            stage_key: [
                {
                    'student_id': student.id,
                    'email': student.user.email,
                    'project_title': student.project_title,
                }
                for student in students.filter(current_stage=stage_key)
            ]
            for stage_key in ['CONCEPT', 'PROPOSAL', 'THESIS', 'COMPLETED']
        }

        not_started = [
            {
                'student_id': student.id,
                'email': student.user.email,
                'project_title': student.project_title,
            }
            for student in students.filter(profile_complete=False)
        ]

        return {
            'completed_counts': {
                'concept': stages.filter(stage_type='CONCEPT', status='COMPLETED').count(),
                'proposal': stages.filter(stage_type='PROPOSAL', status='COMPLETED').count(),
                'thesis': stages.filter(stage_type='THESIS', status='COMPLETED').count(),
            },
            'current_stage_students': current_stage_groups,
            'not_started_students': not_started,
            'per_student_activity_log': [
                {
                    'student_id': student.id,
                    'email': student.user.email,
                    'activities': [
                        {
                            'stage': activity.stage.stage_type,
                            'title': activity.title,
                            'planned_date': activity.planned_date,
                            'status': activity.status,
                        }
                        for stage in student.stages.all()
                        for activity in stage.activities.all()
                    ],
                }
                for student in students
            ],
            'stage_completion_history': [
                {
                    'student_id': stage.student.id,
                    'student_email': stage.student.user.email,
                    'stage': stage.stage_type,
                    'status': stage.status,
                    'approved_by': stage.approved_by.email if stage.approved_by else None,
                    'completed_at': stage.completed_at,
                }
                for stage in stages.order_by('-completed_at')
            ],
        }

    def _user_report_payload(self, request):
        users = User.objects.all().order_by('email')
        role_filter = request.query_params.get('role')
        name_filter = request.query_params.get('name')

        if role_filter:
            users = users.filter(role=role_filter.lower())
        if name_filter:
            users = users.filter(
                Q(email__icontains=name_filter)
                | Q(first_name__icontains=name_filter)
                | Q(last_name__icontains=name_filter)
            )

        login_logs = AuditLog.objects.filter(
            action='LOGIN').order_by('-timestamp')
        login_logs = self._filter_queryset_by_date(
            login_logs, 'timestamp', request)

        return {
            'login_history': [
                {
                    'user': log.user.email if log.user else None,
                    'date': log.timestamp.date(),
                    'time': log.timestamp.time(),
                    'duration': None,
                    'last_login_timestamp': log.user.last_login if log.user else None,
                    'ip_address': log.ip_address,
                }
                for log in login_logs
            ],
            'users': [
                {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role_key,
                    'last_login': user.last_login,
                    'status': 'active' if user.last_login and user.last_login >= timezone.now() - timedelta(days=30) else 'inactive',
                    'activity_log': [
                        {
                            'action': log.action,
                            'description': log.description,
                            'timestamp': log.timestamp,
                        }
                        for log in AuditLog.objects.filter(user=user).order_by('-timestamp')[:50]
                    ],
                }
                for user in users
            ],
        }

    def _supervisor_report_payload(self, request):
        supervisors = User.objects.filter(role='supervisor').order_by('email')
        supervisor_stats = []
        for supervisor in supervisors:
            assigned_students = Student.objects.filter(
                assigned_supervisor=supervisor).select_related('user')
            pending_approvals = Stage.objects.filter(
                student__assigned_supervisor=supervisor, status='ACTIVE').count()
            approval_history = Stage.objects.filter(approved_by=supervisor).select_related(
                'student__user').order_by('-approval_date')
            supervisor_stats.append({
                'supervisor_email': supervisor.email,
                'students': [
                    {
                        'student_id': student.id,
                        'email': student.user.email,
                        'project_title': student.project_title,
                    }
                    for student in assigned_students
                ],
                'approval_history': [
                    {
                        'student_email': stage.student.user.email,
                        'stage': stage.stage_type,
                        'approval_date': stage.approval_date,
                    }
                    for stage in approval_history
                ],
                'pending_approvals': pending_approvals,
            })
        return supervisor_stats

    def _complaint_report_payload(self, request):
        complaints = Complaint.objects.select_related(
            'student__user', 'responded_by').order_by('-submitted_at')
        complaints = self._filter_queryset_by_date(
            complaints, 'submitted_at', request)
        return {
            'summary': {
                'total': complaints.count(),
                'submitted': complaints.filter(status='SUBMITTED').count(),
                'under_review': complaints.filter(status='UNDER_REVIEW').count(),
                'resolved': complaints.filter(status='RESOLVED').count(),
                'overdue': complaints.filter(is_overdue=True).count(),
            },
            'items': [
                {
                    'id': complaint.id,
                    'student_email': complaint.student.user.email,
                    'status': complaint.status,
                    'submitted_at': complaint.submitted_at,
                    'responded_at': complaint.responded_at,
                    'is_overdue': complaint.is_overdue,
                }
                for complaint in complaints
            ],
        }

    @action(detail=False, methods=['get'], url_path='students')
    def students(self, request):
        return Response(self._student_report_payload(request))

    @action(detail=False, methods=['get'], url_path='users')
    def users(self, request):
        return Response(self._user_report_payload(request))

    @action(detail=False, methods=['get'], url_path='supervisors')
    def supervisors(self, request):
        return Response(self._supervisor_report_payload(request))

    @action(detail=False, methods=['get'], url_path='complaints')
    def complaints(self, request):
        return Response(self._complaint_report_payload(request))

    @action(detail=False, methods=['get'], url_path='student_progress')
    def student_progress(self, request):
        return self.students(request)

    @action(detail=False, methods=['get'], url_path='supervisor_report')
    def supervisor_report(self, request):
        return self.supervisors(request)

    @action(detail=False, methods=['get'], url_path='complaint_report')
    def complaint_report(self, request):
        return self.complaints(request)

    @action(detail=False, methods=['get'], url_path='login_history')
    def login_history(self, request):
        return Response(self._user_report_payload(request)['login_history'])

    @action(detail=False, methods=['get'], url_path='activity_log')
    def activity_log(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')
        logs = self._filter_queryset_by_date(logs, 'timestamp', request)
        return Response([
            {
                'user': log.user.email if log.user else 'System',
                'action': log.action,
                'description': log.description,
                'timestamp': log.timestamp,
            }
            for log in logs[:200]
        ])

    @action(detail=False, methods=['get'], url_path='stage_transition_report')
    def stage_transition_report(self, request):
        return Response(
            {
                'concept_to_proposal': Stage.objects.filter(
                    stage_type='CONCEPT',
                    status='COMPLETED').count(),
                'proposal_to_thesis': Stage.objects.filter(
                    stage_type='PROPOSAL',
                    status='COMPLETED').count(),
                'thesis_completion': Stage.objects.filter(
                    stage_type='THESIS',
                    status='COMPLETED').count(),
            })

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        return ExportReportView().get(request)


class ExportReportView(APIView):
    permission_classes = [IsReportAdmin]

    def get(self, request):
        report_type = request.query_params.get('type')
        format_type = request.query_params.get('format')

        if report_type not in EXPORT_REPORT_TYPES:
            return Response(
                {'error': f'Invalid report type. Accepted types: {", ".join(EXPORT_REPORT_TYPES)}'},
                status=status.HTTP_400_BAD_REQUEST)
        if format_type not in EXPORT_FORMATS:
            return Response(
                {'error': 'Invalid or missing format. Accepted formats: csv, pdf'},
                status=status.HTTP_400_BAD_REQUEST)

        report_view = ReportViewSet()
        report_view.request = request
        payload_getters = {
            'students': report_view._student_report_payload,
            'users': report_view._user_report_payload,
            'supervisors': report_view._supervisor_report_payload,
            'complaints': report_view._complaint_report_payload,
        }
        data = payload_getters[report_type](request)
        generated_date = timezone.now().date().isoformat()
        filename = f'{report_type}_report_{generated_date}.{format_type}'

        if format_type == 'csv':
            response = self._csv_response(report_type, data, filename)
        else:
            response = self._pdf_response(report_type, data, filename)

        log_audit_event(
            user=request.user,
            action='REPORT_GENERATION',
            description=(
                f'{request.user.email} generated a {report_type} report '
                f'in {format_type.upper()} format.'
            ),
            ip_address=getattr(request, 'client_ip', None),
            extra_data={'report_type': report_type, 'format': format_type},
        )
        return response

    def _csv_response(self, report_type, data, filename):
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['report_type', report_type])
        writer.writerow(['generated_at', timezone.now().isoformat()])
        writer.writerow([])
        writer.writerow(['section', 'data'])

        if isinstance(data, dict):
            for key, value in data.items():
                writer.writerow([key, json.dumps(value, default=str)])
        else:
            for row in data:
                writer.writerow([report_type, json.dumps(row, default=str)])

        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def _pdf_response(self, report_type, data, filename):
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 50
        lines = [
            f'Report Type: {report_type}',
            f'Generated At: {timezone.now().isoformat()}',
            '',
            json.dumps(data, default=str, indent=2),
        ]
        for block in lines:
            for line in str(block).splitlines() or ['']:
                if y < 50:
                    pdf.showPage()
                    y = height - 50
                pdf.drawString(50, y, line[:110])
                y -= 14
        pdf.save()
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
