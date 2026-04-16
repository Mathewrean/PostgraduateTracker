from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Activity
from .serializers import ActivitySerializer
from apps.stages.models import Stage
from apps.students.models import Student

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            try:
                student = Student.objects.get(user=user)
                return Activity.objects.filter(stage__student=student).select_related('stage__student__user', 'created_by', 'marked_done_by')
            except Student.DoesNotExist:
                return Activity.objects.none()
        elif user.role in ['COORDINATOR', 'ADMIN']:
            return Activity.objects.all().select_related('stage__student__user', 'created_by', 'marked_done_by')
        elif user.role == 'SUPERVISOR':
            return Activity.objects.filter(stage__student__assigned_supervisor=user).select_related('stage__student__user', 'created_by', 'marked_done_by')
        return Activity.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data
        stage_id = data.get('stage')
        
        try:
            stage = Stage.objects.get(id=stage_id)
            if stage.status != 'ACTIVE':
                return Response({'error': 'Can only add activities to active stages'}, status=status.HTTP_400_BAD_REQUEST)
            if request.user.role == 'STUDENT' and stage.student.user != request.user:
                raise PermissionDenied('You can only add activities to your own stage.')
            if request.user.role == 'SUPERVISOR' and stage.student.assigned_supervisor != request.user:
                raise PermissionDenied('You can only add activities to students assigned to you.')
            
            activity = Activity.objects.create(
                stage=stage,
                created_by=request.user,
                title=data.get('title'),
                description=data.get('description', ''),
                planned_date=data.get('planned_date')
            )
            serializer = self.get_serializer(activity)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        activity = self.get_object()
        if request.user.role == 'SUPERVISOR' and activity.stage.student.assigned_supervisor != request.user:
            raise PermissionDenied('Only the assigned supervisor can mark this activity complete.')
        if request.user.role == 'STUDENT' and activity.stage.student.user != request.user:
            raise PermissionDenied('You can only mark your own activities complete.')
        
        if activity.status == 'COMPLETED':
            return Response({'error': 'Activity already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        activity.status = 'COMPLETED'
        activity.completed_date = timezone.now()
        activity.marked_done_by = request.user
        activity.save()
        
        serializer = self.get_serializer(activity)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get activities for calendar view"""
        activities = self.get_queryset()
        stage_id = request.query_params.get('stage_id')
        if stage_id:
            activities = activities.filter(stage_id=stage_id)
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
