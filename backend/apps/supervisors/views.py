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
        from rest_framework.permissions import BasePermission

        class IsSupervisorOnly(BasePermission):
            def has_permission(self, request, view):
                return request.user and request.user.role_key == 'supervisor'

        if request.method == 'GET':
            # Return 403 for non-supervisor roles
            if request.user.role_key != 'supervisor':
                from rest_framework.exceptions import PermissionDenied as DRFDenied
                raise DRFDenied('Only supervisors can access this endpoint.')

            from apps.users.serializers import UserSerializer
            from apps.supervisors.models import Supervisor

            serializer = UserSerializer(request.user, context={'request': request})
            data = serializer.data

            # Get assigned student IDs
            assigned_students = Student.objects.filter(
                assigned_supervisor=request.user
            ).values_list('id', flat=True)
            data['assigned_student_ids'] = list(assigned_students)

            # Add supervisor-specific fields
            try:
                supervisor_profile = request.user.supervisor_profile
                data['department'] = supervisor_profile.department
                data['specialisation'] = supervisor_profile.specialisation
            except Exception:
                data['department'] = ''
                data['specialisation'] = ''

            # Add supervisor count to indicate this is a supervisor
            data['supervisor_count'] = Student.objects.filter(
                assigned_supervisor=request.user
            ).count()

            return Response(data)

        elif request.method == 'PATCH':
            # Only supervisors can update their profile
            if request.user.role_key != 'supervisor':
                from rest_framework.exceptions import PermissionDenied as DRFDenied
                raise DRFDenied('Only supervisors can update their profile.')

            from apps.supervisors.models import Supervisor
            from apps.supervisors.serializers import SupervisorProfileSerializer

            # Update User fields
            user_serializable = ['email', 'phone', 'first_name', 'last_name']
            for field in user_serializable:
                if field in request.data:
                    setattr(request.user, field, request.data[field])
            request.user.save()

            # Update or create Supervisor profile
            supervisor_profile, created = Supervisor.objects.get_or_create(
                user=request.user,
                defaults={'department': '', 'specialisation': ''}
            )

            supervisor_serializer = SupervisorProfileSerializer(
                supervisor_profile, data=request.data, partial=True
            )
            if supervisor_serializer.is_valid():
                supervisor_serializer.save()

            return Response(UserSerializer(request.user, context={'request': request}).data)
