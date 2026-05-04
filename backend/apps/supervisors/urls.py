from django.urls import path

from .views import SupervisorViewSet


supervisor_students = SupervisorViewSet.as_view({'get': 'students'})
supervisor_approvals = SupervisorViewSet.as_view({'get': 'approvals'})
supervisor_profile = SupervisorViewSet.as_view({'get': 'profile', 'patch': 'profile'})

urlpatterns = [
    path('students/', supervisor_students, name='supervisor-students'),
    path('approvals/', supervisor_approvals, name='supervisor-approvals'),
    path('profile/', supervisor_profile, name='supervisor-profile'),
]
