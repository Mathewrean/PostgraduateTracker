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
from apps.notifications.services import notify

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            try:
                student = Student.objects.get(user=user)
                queryset = Activity.objects.filter(stage__student=student)
            except Student.DoesNotExist:
                return Activity.objects.none()
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = Activity.objects.all()
        elif user.role_key == 'supervisor':
            queryset = Activity.objects.filter(stage__student__assigned_supervisor=user)
        else:
            return Activity.objects.none()

        stage_id = self.request.query_params.get('stage')
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)

        return queryset.select_related('stage__student__user', 'created_by', 'marked_done_by')

    def create(self, request, *args, **kwargs):
        data = request.data
        stage_id = data.get('stage')
        
        try:
            stage = Stage.objects.get(id=stage_id)
            if stage.status != 'ACTIVE':
                return Response({'error': 'Can only add activities to active stages'}, status=status.HTTP_400_BAD_REQUEST)
            if request.user.role_key == 'student' and stage.student.user != request.user:
                raise PermissionDenied('You can only add activities to your own stage.')
            if request.user.role_key == 'supervisor' and stage.student.assigned_supervisor != request.user:
                raise PermissionDenied('You can only add activities to students assigned to you.')
            
            activity = Activity.objects.create(
                stage=stage,
                created_by=request.user,
                title=data.get('title'),
                description=data.get('description', ''),
                planned_date=data.get('planned_date')
            )
            
            if request.user.role_key != 'student':
                notify(
                    recipient=stage.student.user,
                    message=f'New activity assigned by {request.user.email}: {activity.title}',
                    notification_type='ACTIVITY_REMINDER',
                    link=f'/api/activities/{activity.id}/',
                )
            
            serializer = self.get_serializer(activity)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, *args, **kwargs):
        activity = self.get_object()
        if activity.stage.status != 'ACTIVE':
            return Response({'error': 'Completed stages are read-only.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        activity = self.get_object()
        if activity.stage.status != 'ACTIVE':
            return Response({'error': 'Completed stages are read-only.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.role_key == 'supervisor' and activity.stage.student.assigned_supervisor != request.user:
            raise PermissionDenied('Only the assigned supervisor can mark this activity complete.')
        if request.user.role_key == 'student' and activity.stage.student.user != request.user:
            raise PermissionDenied('You can only mark your own activities complete.')
        
        if activity.status == 'COMPLETED':
            return Response({'error': 'Activity already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        activity.status = 'COMPLETED'
        activity.completed_date = timezone.now()
        activity.marked_done_by = request.user
        activity.save()

        if activity.stage.student.assigned_supervisor_id and request.user.role_key == 'student':
            notify(
                recipient=activity.stage.student.assigned_supervisor,
                message=f'{activity.stage.student.user.email} marked activity "{activity.title}" as completed.',
                notification_type='ACTIVITY_REMINDER',
                link=f'/api/activities/{activity.id}/',
            )
        
        serializer = self.get_serializer(activity)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        return self.mark_done(request, pk=pk)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get activities for calendar view"""
        activities = self.get_queryset()
        stage_id = request.query_params.get('stage_id') or request.query_params.get('stage')
        if stage_id:
            activities = activities.filter(stage_id=stage_id)
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
