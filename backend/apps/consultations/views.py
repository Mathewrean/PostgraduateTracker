from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ConsultationForm
from .serializers import ConsultationFormSerializer
from apps.notifications.services import notify
from apps.stages.models import Stage
from apps.students.models import Student


class ConsultationFormViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationFormSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            queryset = ConsultationForm.objects.filter(student__user=user)
        elif user.role_key == 'supervisor':
            queryset = ConsultationForm.objects.filter(supervisor=user)
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = ConsultationForm.objects.all()
        else:
            queryset = ConsultationForm.objects.none()

        stage_id = self.request.query_params.get('stage')
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)

        return queryset.select_related(
            'student__user',
            'supervisor',
            'stage',
            'minutes_uploaded_by')

    def perform_create(self, serializer):
        if self.request.user.role_key != 'student':
            raise PermissionDenied('Only students can create consultation forms.')

        try:
            student = Student.objects.select_related(
                'assigned_supervisor').get(user=self.request.user)
        except Student.DoesNotExist as exc:
            raise PermissionDenied('Student profile not found.') from exc

        stage_id = self.request.data.get('stage')
        if stage_id:
            stage = Stage.objects.get(id=stage_id, student=student)
        else:
            stage = Stage.objects.filter(
                student=student,
                status='ACTIVE').order_by('-created_at').first()
        if not stage:
            raise PermissionDenied('An active stage is required.')

        serializer.save(
            student=student,
            supervisor=student.assigned_supervisor,
            stage=stage)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        form = self.get_object()
        if request.user.role_key != 'student' or form.student.user_id != request.user.id:
            raise PermissionDenied('Only the owner can submit this form.')
        if form.status != 'draft':
            return Response(
                {'error': 'Only draft forms can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST)

        form.status = 'submitted'
        form.submitted_at = timezone.now()
        form.save(update_fields=['status', 'submitted_at', 'updated_at'])
        form.append_trail(request.user, 'submitted')

        if form.supervisor:
            notify(
                recipient=form.supervisor,
                message='A consultation form is ready for review.',
                notification_type='SUPERVISOR_APPROVAL',
                link=f'/api/consultations/{form.id}/',
            )

        return Response(self.get_serializer(form).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        form = self.get_object()
        if request.user.role_key != 'supervisor' or form.supervisor_id != request.user.id:
            raise PermissionDenied('Only the assigned supervisor can approve this form.')
        if form.status != 'submitted':
            return Response(
                {'error': 'Only submitted forms can be approved.'},
                status=status.HTTP_400_BAD_REQUEST)

        signature = request.data.get('signature') or request.data.get(
            'typed_signature') or ''
        if not signature:
            return Response(
                {'error': 'An e-signature is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        form.status = 'approved'
        form.save(update_fields=['status', 'updated_at'])
        form.append_trail(request.user, 'approved', signature=signature)
        notify(
            recipient=form.student.user,
            message='Your consultation form has been approved.',
            notification_type='SUPERVISOR_APPROVAL',
            link=f'/api/consultations/{form.id}/',
        )
        return Response(self.get_serializer(form).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        form = self.get_object()
        if request.user.role_key != 'supervisor' or form.supervisor_id != request.user.id:
            raise PermissionDenied('Only the assigned supervisor can reject this form.')
        comment = request.data.get('comment') or ''
        if not comment:
            return Response(
                {'error': 'A rejection comment is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        form.status = 'rejected'
        form.save(update_fields=['status', 'updated_at'])
        form.append_trail(request.user, 'rejected', comment=comment)
        notify(
            recipient=form.student.user,
            message='Your consultation form needs revisions.',
            notification_type='SUPERVISOR_APPROVAL',
            link=f'/api/consultations/{form.id}/',
        )
        return Response(self.get_serializer(form).data)

    @action(detail=True, methods=['post'], url_path='upload-minutes')
    def upload_minutes(self, request, pk=None):
        form = self.get_object()
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and administrators can upload minutes.')

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {'error': 'file is required'},
                status=status.HTTP_400_BAD_REQUEST)

        form.minutes_file = uploaded_file
        form.minutes_uploaded_by = request.user
        form.minutes_uploaded_at = timezone.now()
        form.save(update_fields=[
            'minutes_file',
            'minutes_uploaded_by',
            'minutes_uploaded_at',
            'updated_at',
        ])
        form.append_trail(request.user, 'minutes_uploaded')
        return Response(self.get_serializer(form).data)
