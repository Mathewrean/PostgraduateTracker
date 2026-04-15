from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, F, ExpressionWrapper
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.students.models import Student
from apps.stages.models import Stage
from apps.activities.models import Activity
from apps.documents.models import Document
from apps.complaints.models import Complaint
from apps.users.models import User
from apps.students.serializers import StudentSerializer

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Only coordinators and admins can access reports
        user = self.request.user
        if user.role not in ['COORDINATOR', 'ADMIN']:
            return [status.HTTP_403_FORBIDDEN]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def student_progress(self, request):
        """Get student progress report"""
        date_range = request.query_params.get('range', 'all')
        
        students = Student.objects.all()
        if date_range == 'week':
            start_date = timezone.now() - timedelta(days=7)
            students = students.filter(created_at__gte=start_date)
        elif date_range == 'month':
            start_date = timezone.now() - timedelta(days=30)
            students = students.filter(created_at__gte=start_date)

        stages = {
            'CONCEPT': students.filter(current_stage='CONCEPT').count(),
            'PROPOSAL': students.filter(current_stage='PROPOSAL').count(),
            'THESIS': students.filter(current_stage='THESIS').count(),
            'COMPLETED': students.filter(current_stage='COMPLETED').count(),
        }

        return Response({
            'total_students': students.count(),
            'stages': stages,
            'profile_complete': students.filter(profile_complete=True).count(),
            'profile_incomplete': students.filter(profile_complete=False).count(),
        })

    @action(detail=False, methods=['get'])
    def supervisor_report(self, request):
        """Get supervisor activity report"""
        supervisors = Student.objects.values('assigned_supervisor').annotate(
            student_count=Count('id')
        ).filter(assigned_supervisor__isnull=False)

        data = []
        for sup in supervisors:
            sup_user = User.objects.get(id=sup['assigned_supervisor'])
            student_count = sup['student_count']
            approved_count = Stage.objects.filter(
                approved_by=sup_user,
                status='COMPLETED'
            ).count()
            
            data.append({
                'supervisor_email': sup_user.email,
                'total_students': student_count,
                'approved_stages': approved_count,
            })

        return Response(data)

    @action(detail=False, methods=['get'])
    def login_history(self, request):
        """Get login history"""
        from apps.audit.models import AuditLog
        
        logs = AuditLog.objects.all().order_by('-timestamp')[:100]
        data = []
        for log in logs:
            if log.user:
                data.append({
                    'user': log.user.email,
                    'timestamp': log.timestamp,
                    'ip_address': log.ip_address,
                })

        return Response(data)

    @action(detail=False, methods=['get'])
    def complaint_report(self, request):
        """Get complaint statistics"""
        total = Complaint.objects.count()
        submitted = Complaint.objects.filter(status='SUBMITTED').count()
        under_review = Complaint.objects.filter(status='UNDER_REVIEW').count()
        resolved = Complaint.objects.filter(status='RESOLVED').count()
        overdue = Complaint.objects.filter(is_overdue=True).count()

        # Average response time
        from django.db.models import Avg, F, ExpressionWrapper
        from django.db.models.functions import Extract
        
        avg_response_time = Complaint.objects.filter(
            responded_at__isnull=False
        ).aggregate(
            avg_time=Avg(ExpressionWrapper(
                Extract('responded_at', 'epoch') - Extract('submitted_at', 'epoch'),
                output_field=models.IntegerField()
            ))
        )['avg_time']

        return Response({
            'total': total,
            'submitted': submitted,
            'under_review': under_review,
            'resolved': resolved,
            'overdue': overdue,
            'avg_response_time_hours': avg_response_time / 3600 if avg_response_time else 0,
        })

    @action(detail=False, methods=['get'])
    def activity_log(self, request):
        """Get activity log"""
        from apps.audit.models import AuditLog
        
        date_range = request.query_params.get('range', 'week')
        
        if date_range == 'day':
            start_date = timezone.now() - timedelta(days=1)
        elif date_range == 'week':
            start_date = timezone.now() - timedelta(days=7)
        elif date_range == 'month':
            start_date = timezone.now() - timedelta(days=30)
        else:
            start_date = None

        if start_date:
            logs = AuditLog.objects.filter(timestamp__gte=start_date).order_by('-timestamp')
        else:
            logs = AuditLog.objects.all().order_by('-timestamp')

        data = []
        for log in logs[:100]:
            data.append({
                'user': log.user.email if log.user else 'System',
                'action': log.action,
                'timestamp': log.timestamp,
            })

        return Response(data)

    @action(detail=False, methods=['get'])
    def stage_transition_report(self, request):
        """Get stage transition report"""
        stages = Stage.objects.all()
        
        report = {
            'concept_to_proposal': stages.filter(
                stage_type='CONCEPT',
                status='COMPLETED'
            ).count(),
            'proposal_to_thesis': stages.filter(
                stage_type='PROPOSAL',
                status='COMPLETED'
            ).count(),
            'thesis_completion': stages.filter(
                stage_type='THESIS',
                status='COMPLETED'
            ).count(),
        }

        return Response(report)
