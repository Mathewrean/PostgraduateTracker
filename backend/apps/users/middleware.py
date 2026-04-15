from django.utils.deprecation import MiddlewareMixin
from apps.audit.models import AuditLog
import logging

logger = logging.getLogger(__name__)

class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all user actions for audit trail
    """
    def process_request(self, request):
        request.client_ip = self.get_client_ip(request)
        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def process_response(self, request, response):
        if request.user and request.user.is_authenticated:
            # Log API endpoints
            if request.path.startswith('/api/'):
                try:
                    AuditLog.objects.create(
                        user=request.user,
                        action=f'{request.method} {request.path}',
                        description=f'{request.method} request to {request.path}',
                        ip_address=request.client_ip,
                        extra_data={'method': request.method, 'path': request.path}
                    )
                except Exception as e:
                    logger.error(f'Error creating audit log: {str(e)}')
        
        return response
