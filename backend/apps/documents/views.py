from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.conf import settings
from .models import Document, Minutes
from .serializers import DocumentSerializer, MinutesSerializer
from apps.stages.models import Stage
from apps.students.models import Student

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return Document.objects.filter(student=student).select_related('student__user', 'stage', 'verified_by')
            except Student.DoesNotExist:
                return Document.objects.none()
        elif user.role in ['coordinator', 'dean', 'cod', 'director_bps']:
            return Document.objects.all().select_related('student__user', 'stage', 'verified_by')
        elif user.role == 'supervisor':
            return Document.objects.filter(stage__student__assigned_supervisor=user).select_related('student__user', 'stage', 'verified_by')
        return Document.objects.none()

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        stage_id = request.data.get('stage')
        doc_type = request.data.get('doc_type')
        if not file or not stage_id or not doc_type:
            return Response({'error': 'stage, doc_type and file are required'}, status=status.HTTP_400_BAD_REQUEST)

        # File size validation
        if file and file.size > settings.MAX_FILE_SIZE:
            return Response({
                'error': f'File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            stage = Stage.objects.get(id=stage_id)
            student = stage.student
            if request.user.role == 'student' and student.user != request.user:
                raise PermissionDenied('You can only upload documents for your own stage.')
            if request.user.role == 'supervisor' and student.assigned_supervisor != request.user:
                raise PermissionDenied('You can only upload documents for assigned students.')
            
            # Check if document already exists
            existing = Document.objects.filter(stage=stage, doc_type=doc_type).first()
            if existing:
                existing.file.delete()
                existing.delete()
            
            document = Document.objects.create(
                stage=stage,
                student=student,
                doc_type=doc_type,
                file=file
            )
            
            # If this is a THESIS stage, check if all required docs are now uploaded
            if stage.stage_type == 'THESIS':
                stage.check_thesis_submission_complete()
            
            serializer = self.get_serializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        document = self.get_object()
        if request.user.role not in ['coordinator', 'dean', 'cod', 'director_bps'] and document.student.assigned_supervisor != request.user:
            raise PermissionDenied('Only the assigned supervisor, coordinator, or admin can verify this document.')
        
        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

class MinutesViewSet(viewsets.ModelViewSet):
    serializer_class = MinutesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return Minutes.objects.filter(student=student)
            except Student.DoesNotExist:
                return Minutes.objects.none()
        elif user.role in ['coordinator', 'dean', 'cod', 'director_bps']:
            return Minutes.objects.all()
        elif user.role == 'supervisor':
            return Minutes.objects.filter(stage__student__assigned_supervisor=user)
        return Minutes.objects.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        minutes = self.get_object()
        
        if minutes.stage.student.assigned_supervisor != request.user:
            return Response({'error': 'Only assigned supervisor can approve minutes'}, status=status.HTTP_403_FORBIDDEN)
        
        minutes.is_approved = True
        minutes.approved_by = request.user
        minutes.approved_at = timezone.now()
        minutes.save()
        
        serializer = self.get_serializer(minutes)
        return Response(serializer.data)
