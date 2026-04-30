from pathlib import Path

from django.http import FileResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Document, Minutes
from .serializers import DocumentSerializer, MinutesSerializer
from apps.notifications.services import notify
from apps.stages.models import Stage
from apps.students.models import Student


ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
ALLOWED_MIME_TYPES = {
    'pdf': {'application/pdf'},
    'doc': {'application/msword', 'application/doc', 'application/vnd.ms-word'},
    'docx': {'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
}


def detect_file_type(uploaded_file):
    header = uploaded_file.read(16)
    uploaded_file.seek(0)

    if header.startswith(b'%PDF-'):
        return 'pdf'
    if header.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'):
        return 'doc'
    if header.startswith(b'PK\x03\x04'):
        return 'docx'
    return None


def validate_uploaded_file(uploaded_file):
    suffix = Path(uploaded_file.name).suffix.lower().lstrip('.')
    if suffix not in ALLOWED_EXTENSIONS:
        return 'Invalid file type. Accepted formats: PDF, DOC, DOCX only.'

    detected_type = detect_file_type(uploaded_file)
    if detected_type is None:
        return 'Unable to validate uploaded file contents. Accepted formats: PDF, DOC, DOCX only.'

    if detected_type != suffix:
        return 'Rejected file. The uploaded file content does not match its extension.'

    content_type = getattr(uploaded_file, 'content_type', '')
    if content_type and content_type not in ALLOWED_MIME_TYPES[detected_type]:
        return 'Rejected file. The backend MIME check failed for this upload.'

    return None


class BaseStageFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def _can_access_student_stage(self, user, student):
        if user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            return True
        if user.role_key == 'student':
            return student.user_id == user.id
        if user.role_key == 'supervisor':
            return student.assigned_supervisor_id == user.id
        return False

    def _require_stage_access(self, stage):
        if not self._can_access_student_stage(self.request.user, stage.student):
            raise PermissionDenied('You are not allowed to access this stage.')

    def _require_active_stage(self, stage):
        if stage.status != 'ACTIVE':
            raise PermissionDenied('Uploads are only allowed for active stages.')


class DocumentViewSet(BaseStageFileViewSet):
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            try:
                student = Student.objects.get(user=user)
                queryset = Document.objects.filter(student=student)
            except Student.DoesNotExist:
                return Document.objects.none()
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = Document.objects.all()
        elif user.role_key == 'supervisor':
            queryset = Document.objects.filter(stage__student__assigned_supervisor=user)
        else:
            return Document.objects.none()

        stage_id = self.request.query_params.get('stage')
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)

        return queryset.select_related('student__user', 'stage', 'verified_by')

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        stage_id = request.data.get('stage')
        doc_type = request.data.get('doc_type')

        if not uploaded_file or not stage_id or not doc_type:
            return Response(
                {'error': 'stage, doc_type and file are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File size exceeds the 10MB limit.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validation_error = validate_uploaded_file(uploaded_file)
        if validation_error:
            return Response({'error': validation_error}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stage = Stage.objects.select_related('student__user', 'student__assigned_supervisor').get(id=stage_id)
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)

        self._require_stage_access(stage)
        if stage.status != 'ACTIVE':
            return Response({'error': 'Uploading to a completed or locked stage is not allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        if doc_type == 'MINUTES':
            return Response(
                {'error': 'Minutes of Presentation must be uploaded through the minutes endpoint.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        document, _ = Document.objects.update_or_create(
            stage=stage,
            doc_type=doc_type,
            defaults={
                'student': stage.student,
                'file': uploaded_file,
            },
        )

        if stage.stage_type == 'THESIS':
            stage.check_thesis_submission_complete()

        if stage.student.assigned_supervisor:
            notify(
                recipient=stage.student.assigned_supervisor,
                message=f'{stage.student.user.email} uploaded {document.get_doc_type_display()} for the {stage.get_stage_type_display()} stage.',
                notification_type='DOCUMENT_UPLOAD',
                link=f'/api/documents/{document.id}/',
            )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        document = self.get_object()
        if request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps'] and document.student.assigned_supervisor_id != request.user.id:
            raise PermissionDenied('Only the assigned supervisor, coordinator, or senior administrators can verify this document.')

        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save(update_fields=['is_verified', 'verified_by', 'verified_at'])

        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        document = self.get_object()
        return FileResponse(document.file.open('rb'), as_attachment=True, filename=document.file_name)


class MinutesViewSet(BaseStageFileViewSet):
    serializer_class = MinutesSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            try:
                student = Student.objects.get(user=user)
                queryset = Minutes.objects.filter(student=student)
            except Student.DoesNotExist:
                return Minutes.objects.none()
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = Minutes.objects.all()
        elif user.role_key == 'supervisor':
            queryset = Minutes.objects.filter(stage__student__assigned_supervisor=user)
        else:
            return Minutes.objects.none()

        stage_id = self.request.query_params.get('stage')
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)

        return queryset.select_related('student__user', 'stage', 'approved_by', 'stage__student__assigned_supervisor')

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        stage_id = request.data.get('stage')

        if not uploaded_file or not stage_id:
            return Response({'error': 'stage and file are required'}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size exceeds the 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        validation_error = validate_uploaded_file(uploaded_file)
        if validation_error:
            return Response({'error': validation_error}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stage = Stage.objects.select_related('student__user', 'student__assigned_supervisor').get(id=stage_id)
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)

        self._require_stage_access(stage)
        if stage.status != 'ACTIVE':
            return Response({'error': 'Uploading to a completed or locked stage is not allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        if stage.stage_type not in ['CONCEPT', 'PROPOSAL']:
            return Response({'error': 'Minutes of Presentation are only required for Concept and Proposal stages.'}, status=status.HTTP_400_BAD_REQUEST)

        minutes, _ = Minutes.objects.update_or_create(
            stage=stage,
            defaults={
                'student': stage.student,
                'file': uploaded_file,
                'is_approved': False,
                'approved_by': None,
                'approved_at': None,
            },
        )

        if stage.student.assigned_supervisor:
            notify(
                recipient=stage.student.assigned_supervisor,
                message=f'{stage.student.user.email} uploaded Minutes of Presentation for the {stage.get_stage_type_display()} stage.',
                notification_type='DOCUMENT_UPLOAD',
                link=f'/api/minutes/{minutes.id}/',
            )

        return Response(self.get_serializer(minutes).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        minutes = self.get_object()

        if minutes.stage.student.assigned_supervisor_id != request.user.id:
            return Response({'error': 'Only assigned supervisor can approve minutes'}, status=status.HTTP_403_FORBIDDEN)
        if minutes.is_approved:
            return Response({'error': 'Minutes have already been approved'}, status=status.HTTP_400_BAD_REQUEST)

        minutes.is_approved = True
        minutes.approved_by = request.user
        minutes.approved_at = timezone.now()
        minutes.save(update_fields=['is_approved', 'approved_by', 'approved_at'])

        notify(
            recipient=minutes.student.user,
            message='Your Minutes of Presentation have been approved.',
            notification_type='MINUTES_APPROVAL',
            link=f'/api/stages/{minutes.stage.id}/',
        )

        return Response(self.get_serializer(minutes).data)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        minutes = self.get_object()
        return FileResponse(minutes.file.open('rb'), as_attachment=True, filename=minutes.file_name)
