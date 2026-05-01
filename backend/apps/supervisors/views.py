from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from apps.students.models import Student
from apps.stages.models import Stage


class SupervisorViewSet(viewsets.ViewSet):
    """Viewset for supervisor-specific endpoints"""
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        from rest_framework.permissions import BasePermission

        class IsSupervisorOrAdmin(BasePermission):
            def has_permission(self, request, view):
                return request.user and request.user.role_key in [
                    'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']

        return [IsSupervisorOrAdmin()]

    @action(detail=False, methods=['get'])
    def students(self, request):
        """Get all students assigned to this supervisor"""
        if request.user.role_key == 'supervisor':
            students = Student.objects.filter(
                assigned_supervisor=request.user).select_related(
                'user', 'assigned_supervisor')
        elif request.user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            students = Student.objects.all().select_related('user', 'assigned_supervisor')
        else:
            raise PermissionDenied(
                'Only supervisors, coordinators, and admins can view students.')

        from apps.students.serializers import StudentSerializer
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def approvals(self, request):
        """Get stages pending approval for this supervisor's assigned students"""
        if request.user.role_key == 'supervisor':
            # Get stages for assigned students that need approval
            stages = Stage.objects.filter(
                student__assigned_supervisor=request.user,
                status='ACTIVE'
            ).select_related('student__user', 'approved_by')
        elif request.user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            stages = Stage.objects.filter(
                status='ACTIVE').select_related(
                'student__user', 'approved_by')
        else:
            raise PermissionDenied(
                'Only supervisors, coordinators, and admins can view approvals.')

        from apps.stages.serializers import StageSerializer
        serializer = StageSerializer(stages, many=True)
        return Response(serializer.data)
