from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'STUDENT'

class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'SUPERVISOR'

class IsCoordinator(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'COORDINATOR'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ADMIN'

class IsAssignedSupervisor(BasePermission):
    """
    Only the assigned supervisor can approve stage transitions
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'assigned_supervisor'):
            return request.user == obj.assigned_supervisor.user
        return False

class IsReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS

class RoleBasedPermission(BasePermission):
    """
    Role-based permission class for more granular control
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        # Coordinators and Admins can access everything
        if user.role in ['COORDINATOR', 'ADMIN']:
            return True
        
        # Students can only access their own data
        if user.role == 'STUDENT':
            return True
        
        # Supervisors can access student data they supervise
        if user.role == 'SUPERVISOR':
            return True
        
        return False
