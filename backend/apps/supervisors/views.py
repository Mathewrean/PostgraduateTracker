from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from apps.students.models import Student
from apps.stages.models import Stage
from apps.users.serializers import UserSerializer
from apps.supervisors.serializers import SupervisorProfileSerializer


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

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        """Get or update supervisor profile"""
        if request.user.role_key != 'supervisor':
            raise PermissionDenied('Only supervisors can access this endpoint.')

        from apps.supervisors.models import Supervisor
        from apps.supervisors.serializers import SupervisorProfileSerializer

        supervisor_profile, _ = Supervisor.objects.get_or_create(
            user=request.user,
            defaults={'department': '', 'specialisation': ''}
        )

        if request.method == 'GET':
            serializer = SupervisorProfileSerializer(
                supervisor_profile,
                context={'request': request}
            )
            return Response(serializer.data)

        serializer = SupervisorProfileSerializer(
            supervisor_profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
