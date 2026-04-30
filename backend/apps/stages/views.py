from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Stage
from .serializers import StageSerializer
from apps.students.models import Student

class StageViewSet(viewsets.ModelViewSet):
    serializer_class = StageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            try:
                student = Student.objects.get(user=user)
                queryset = Stage.objects.filter(student=student)
            except Student.DoesNotExist:
                return Stage.objects.none()
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = Stage.objects.all()
        elif user.role_key == 'supervisor':
            queryset = Stage.objects.filter(student__assigned_supervisor=user)
        else:
            return Stage.objects.none()

        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset.select_related(
            'student__user', 'approved_by', 'student__assigned_supervisor'
        ).prefetch_related('activities', 'documents', 'minutes')

    def create(self, request, *args, **kwargs):
        if request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can create stages.')
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can update stages.')
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can update stages.')
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can delete stages.')
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def current_stage(self, request):
        try:
            student = Student.objects.get(user=request.user)
            current_stage = Stage.objects.filter(
                student=student,
                status__in=['ACTIVE', 'IN_PROGRESS']
            ).order_by('id').first()
            if current_stage:
                serializer = self.get_serializer(current_stage)
                return Response(serializer.data)
            return Response({'error': 'No active stage'}, status=status.HTTP_404_NOT_FOUND)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        stage = self.get_object()
        
        # Check if user is assigned supervisor
        if request.user != stage.student.assigned_supervisor:
            return Response({'error': 'Only assigned supervisor can approve'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the stage is in ACTIVE status (only ACTIVE stages can be approved)
        if stage.status != 'ACTIVE':
            return Response({'error': 'Only active stages can be approved'}, status=status.HTTP_400_BAD_REQUEST)

        blockers = stage.approval_blockers()
        if blockers.get('missing_documents'):
            return Response({
                'error': 'Missing mandatory documents',
                'missing_document_types': blockers['missing_documents'],
            }, status=status.HTTP_400_BAD_REQUEST)

        if blockers.get('incomplete_activities'):
            return Response({
                'error': 'All planned activities must be marked as completed',
                'incomplete_activities': blockers['incomplete_activities'],
            }, status=status.HTTP_400_BAD_REQUEST)

        if blockers.get('minutes'):
            return Response({
                'error': 'Minutes of Presentation approval is required before stage approval',
                'minutes': blockers['minutes'],
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Approve stage
        stage.status = 'COMPLETED'
        stage.approved_by = request.user
        stage.approval_date = timezone.now()
        stage.completed_at = timezone.now()
        stage.save(update_fields=['status', 'approved_by', 'approval_date', 'completed_at'])
        
        # Notify student
        from apps.notifications.services import notify
        notify(
            recipient=stage.student.user,
            message=f'Your {stage.get_stage_type_display()} stage has been approved by the assigned supervisor.',
            notification_type='SUPERVISOR_APPROVAL',
            link=f'/api/stages/{stage.id}/'
        )
        
        # Create next stage if applicable (not for THESIS which is final)
        stage_progression = {'CONCEPT': 'PROPOSAL', 'PROPOSAL': 'THESIS', 'THESIS': 'COMPLETED'}
        next_stage_type = stage_progression.get(stage.stage_type)
        
        if next_stage_type and next_stage_type != 'COMPLETED':
            Stage.objects.get_or_create(student=stage.student, stage_type=next_stage_type, defaults={'status': 'ACTIVE'})

        stage.student.current_stage = next_stage_type if next_stage_type else 'COMPLETED'
        stage.student.save(update_fields=['current_stage'])

        return Response(self.get_serializer(stage).data)
