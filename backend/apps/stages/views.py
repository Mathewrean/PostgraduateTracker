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
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return Stage.objects.filter(student=student).select_related('student__user', 'approved_by', 'student__assigned_supervisor')
            except Student.DoesNotExist:
                return Stage.objects.none()
        elif user.role in ['coordinator', 'dean', 'cod', 'director_bps']:
            return Stage.objects.all().select_related('student__user', 'approved_by', 'student__assigned_supervisor')
        elif user.role == 'supervisor':
            return Stage.objects.filter(student__assigned_supervisor=user).select_related('student__user', 'approved_by', 'student__assigned_supervisor')
        return Stage.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can create stages.')
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can update stages.')
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can update stages.')
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('Only coordinators and admins can delete stages.')
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def current_stage(self, request):
        try:
            student = Student.objects.get(user=request.user)
            current_stage = Stage.objects.filter(student=student, status='ACTIVE').first()
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
        
        # Check stage type and gate requirements
        from apps.documents.models import Document
        from apps.activities.models import Activity
        
        mandatory_docs = {
            'CONCEPT': ['MINUTES', 'TRANSCRIPT', 'FEE_STATEMENT'],
            'PROPOSAL': ['MINUTES', 'FEE_STATEMENT', 'PROPOSAL'],
            'THESIS': ['THESIS', 'INTENT_TO_SUBMIT', 'FEE_STATEMENT'],
        }
        
        required_docs = mandatory_docs.get(stage.stage_type, [])
        uploaded_docs = Document.objects.filter(stage=stage, doc_type__in=required_docs).values_list('doc_type', flat=True)
        
        if set(uploaded_docs) != set(required_docs):
            missing = set(required_docs) - set(uploaded_docs)
            return Response({
                'error': 'Missing mandatory documents',
                'missing': list(missing)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check all activities are done
        pending_activities = Activity.objects.filter(stage=stage, status='PLANNED')
        if pending_activities.exists():
            return Response({
                'error': 'All planned activities must be marked as completed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # For THESIS stage: check if the three-month waiting period has elapsed
        if stage.stage_type == 'THESIS':
            # If three_month_unlock_date is set and hasn't passed, reject
            if stage.three_month_unlock_date:
                if timezone.now() < stage.three_month_unlock_date:
                    return Response({
                        'error': 'Thesis approval is locked until 3-month waiting period elapses',
                        'unlock_date': stage.three_month_unlock_date
                    }, status=status.HTTP_403_FORBIDDEN)
            else:
                # No unlock date set - this shouldn't happen if documents were uploaded correctly
                return Response({
                    'error': 'Thesis waiting period not yet started. Ensure all documents uploaded.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Approve stage
        stage.status = 'COMPLETED'
        stage.approved_by = request.user
        stage.approval_date = timezone.now()
        stage.completed_at = timezone.now()
        stage.save()
        
        # For THESIS stage: set the 3-month timer AFTER approval
        if stage.stage_type == 'THESIS':
            from datetime import timedelta
            stage.three_month_unlock_date = timezone.now() + timedelta(days=90)
            # Keep status as COMPLETED; the unlock task will change it to ACTIVE when timer expires
            stage.save()
        
        # Move to next stage (create next stage if not final)
        stage_progression = {'CONCEPT': 'PROPOSAL', 'PROPOSAL': 'THESIS', 'THESIS': 'COMPLETED'}
        next_stage_type = stage_progression.get(stage.stage_type)
        
        if next_stage_type and next_stage_type != 'COMPLETED':
            Stage.objects.create(student=stage.student, stage_type=next_stage_type)
        
        return Response(StageSerializer(stage).data)
