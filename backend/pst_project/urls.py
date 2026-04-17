from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework.views import APIView

class APIRootView(APIView):
    def get(self, request):
        return Response({
            'message': 'PST API Server Running',
            'endpoints': {
                'auth': '/api/auth/token/',
                'users': '/api/users/',
                'students': '/api/students/',
                'stage': '/api/stages/',
                'activities': '/api/activities/',
                'documents': '/api/documents/',
                'complaints': '/api/complaints/',
                'notifications': '/api/notifications/',
                'reports': '/api/reports/',
                'audit': '/api/audit/',
                'health': '/api/health/',
                'admin': '/admin/',
            }
        })

class HealthCheckView(APIView):
    def get(self, request):
        return Response({'status': 'ok'})

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/', APIRootView.as_view(), name='api-root-alt'),
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/users/', include('apps.users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/supervisors/', include('apps.supervisors.urls')),
    path('api/stages/', include('apps.stages.urls')),
    path('api/activities/', include('apps.activities.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/audit/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
