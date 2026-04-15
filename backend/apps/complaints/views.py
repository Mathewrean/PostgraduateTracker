from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Complaint
from .serializers import ComplaintSerializer
from apps.students.models import Student

class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            try:
                student = Student.objects.get(user=user)
                return Complaint.objects.filter(student=student)
            except Student.DoesNotExist:
                return Complaint.objects.none()
        elif user.role in ['COORDINATOR', 'ADMIN']:
            return Complaint.objects.all()
        return Complaint.objects.none()

    def create(self, request):
        """Submit a new complaint"""
        try:
            student = Student.objects.get(user=request.user)
            content = request.data.get('content')
            
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            complaint = Complaint.objects.create(student=student, content=content)
            
            # Send notifications to Coordinator and Admins
            from apps.notifications.models import Notification
            from apps.users.models import User
            
            recipients = User.objects.filter(role__in=['COORDINATOR', 'ADMIN'])
            for recipient in recipients:
                Notification.objects.create(
                    recipient=recipient,
                    message=f'New complaint submitted by {student.user.email}',
                    notification_type='COMPLAINT_RECEIVED',
                    link=f'/api/complaints/{complaint.id}/'
                )
            
            serializer = self.get_serializer(complaint)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to a complaint"""
        complaint = self.get_object()
        
        if complaint.status == 'RESOLVED':
            return Response({'error': 'Complaint already resolved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Accept both 'response_content' and 'response_text' field names
        response_content = request.data.get('response_content') or request.data.get('response_text')
        if not response_content:
            return Response({'error': 'Response content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        complaint.response_content = response_content
        complaint.responded_at = timezone.now()
        complaint.responded_by = request.user
        complaint.status = 'RESOLVED'
        complaint.save()
        
        # Send notification to student
        from apps.notifications.models import Notification
        Notification.objects.create(
            recipient=complaint.student.user,
            message='Your complaint has been responded to',
            notification_type='COMPLAINT_RESPONSE',
            link=f'/api/complaints/{complaint.id}/'
        )
        
        serializer = self.get_serializer(complaint)
        return Response(serializer.data)
