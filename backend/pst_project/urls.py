from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from apps.users.views import UserViewSet
from apps.notifications.views import MeetingViewSet
from apps.audit.views import AuditLogViewSet
from apps.documents.views import MinutesViewSet

class APIRootView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'message': 'PST API Server Running',
            'endpoints': {
                'auth': '/api/auth/login/',
                'profile': '/api/auth/profile/',
                'students': '/api/students/',
                'stage': '/api/stages/',
                'activities': '/api/activities/',
                'documents': '/api/documents/',
                'minutes': '/api/minutes/',
                'meetings': '/api/meetings/',
                'complaints': '/api/complaints/',
                'notifications': '/api/notifications/',
                'reports': '/api/reports/',
                'logs': '/api/logs/',
                'health': '/api/health/',
                'admin': '/admin/',
            }
        })

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok'})

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/', APIRootView.as_view(), name='api-root-alt'),
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/login/', UserViewSet.as_view({'post': 'login'}), name='auth-login'),
    path('api/auth/logout/', UserViewSet.as_view({'post': 'logout'}), name='auth-logout'),
    path('api/auth/profile/', UserViewSet.as_view({'get': 'me', 'patch': 'update_profile'}), name='auth-profile'),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/users/', include('apps.users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/supervisor/', include('apps.supervisors.urls')),
    path('api/supervisors/', include('apps.supervisors.urls')),
    path('api/stages/', include('apps.stages.urls')),
    path('api/activities/', include('apps.activities.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/minutes/', MinutesViewSet.as_view({'get': 'list', 'post': 'create'}), name='minutes-root'),
    path('api/minutes/<int:pk>/', MinutesViewSet.as_view({'get': 'retrieve'}), name='minutes-detail-root'),
    path('api/minutes/<int:pk>/approve/', MinutesViewSet.as_view({'post': 'approve'}), name='minutes-approve-root'),
    path('api/minutes/<int:pk>/download/', MinutesViewSet.as_view({'get': 'download'}), name='minutes-download-root'),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/meetings/', MeetingViewSet.as_view({'get': 'list', 'post': 'create'}), name='meeting-list'),
    path('api/meetings/<int:pk>/', MeetingViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'}), name='meeting-detail'),
    path('api/reports/', include('apps.reports.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/logs/', AuditLogViewSet.as_view({'get': 'list'}), name='audit-log-list'),
    path('api/logs/<int:pk>/', AuditLogViewSet.as_view({'get': 'retrieve'}), name='audit-log-detail'),
]
