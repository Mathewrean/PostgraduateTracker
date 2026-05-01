from django.urls import path

from .views import SupervisorViewSet


supervisor_students = SupervisorViewSet.as_view({'get': 'students'})
supervisor_approvals = SupervisorViewSet.as_view({'get': 'approvals'})

urlpatterns = [
    path('students/', supervisor_students, name='supervisor-students'),
    path('approvals/', supervisor_approvals, name='supervisor-approvals'),
]
