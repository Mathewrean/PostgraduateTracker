from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Student
from .serializers import StudentSerializer, StudentProfileSerializer
from apps.stages.models import Stage


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role_key == 'student':
            return Student.objects.filter(
                user=user).select_related(
                'user', 'assigned_supervisor')
        elif user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            return Student.objects.all().select_related('user', 'assigned_supervisor')
        elif user.role_key == 'supervisor':
            return Student.objects.filter(
                assigned_supervisor=user).select_related(
                'user', 'assigned_supervisor')
        return Student.objects.none()

    def list(self, request, *args, **kwargs):
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Only coordinators and senior administrators can view all students.')
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        student = self.get_object()
        user = request.user
        if user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            return super().retrieve(request, *args, **kwargs)
        if user.role_key == 'student' and student.user_id == user.id:
            return super().retrieve(request, *args, **kwargs)
        if user.role_key == 'supervisor' and student.assigned_supervisor_id == user.id:
            return super().retrieve(request, *args, **kwargs)
        raise PermissionDenied(
            'You are not allowed to view this student record.')

    def create(self, request, *args, **kwargs):
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Only coordinators and admins can create student records.')
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Use the profile endpoint for student updates.')
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Use the profile endpoint for student updates.')
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role_key not in [
                'coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Only coordinators and admins can delete student records.')
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'post', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            try:
                student = Student.objects.get(user=request.user)
                serializer = StudentSerializer(student)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response(
                    {'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        elif request.method in ['POST', 'PATCH']:
            try:
                student = Student.objects.get(user=request.user)
            except Student.DoesNotExist:
                student = Student.objects.create(user=request.user)
                Stage.objects.get_or_create(
                    student=student, stage_type='CONCEPT')

            serializer = StudentProfileSerializer(
                student, data=request.data, partial=True)
            if serializer.is_valid():
                profile = serializer.save()
                profile.profile_complete = bool(profile.project_title and (
                    profile.preferred_supervisor or profile.preferred_supervisor_other))
                profile.save()
                return Response(StudentSerializer(profile).data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
