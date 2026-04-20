from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer, MeetingSerializer
from apps.users.models import User
from apps.activities.models import Meeting
from apps.students.models import Student

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'success': True})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Meeting.objects.filter(Q(student__user=user) | Q(supervisor=user)).select_related('student__user', 'supervisor')

    def create(self, request, *args, **kwargs):
        supervisor_id = request.data.get('supervisor')
        scheduled_date = request.data.get('scheduled_date')
        if request.user.role != 'STUDENT':
            raise PermissionDenied('Only students can request meetings.')
        if not supervisor_id or not scheduled_date:
            return Response({'error': 'supervisor and scheduled_date are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            supervisor = User.objects.get(id=supervisor_id, role='SUPERVISOR')
        except User.DoesNotExist:
            return Response({'error': 'Selected supervisor is invalid'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        meeting = Meeting.objects.create(
            student=student,
            supervisor=supervisor,
            scheduled_date=scheduled_date,
            notes=request.data.get('notes', '')
        )

        # Send notification to supervisor
        Notification.objects.create(
            recipient=supervisor,
            message=f'Meeting request from {request.user.email}',
            notification_type='MEETING_REQUEST',
            link=f'/api/notifications/meetings/{meeting.id}/'
        )

        serializer = self.get_serializer(meeting)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
