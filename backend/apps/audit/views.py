from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Only Director BPS can view audit logs
        if user.role == 'director_bps':
            return AuditLog.objects.all()
        return AuditLog.objects.none()

    @action(detail=False, methods=['get'])
    def user_logs(self, request):
        if request.user.role != 'director_bps':
            raise PermissionDenied('Only Director BPS can access audit logs.')
        user_id = request.query_params.get('user_id')
        if user_id:
            logs = self.get_queryset().filter(user_id=user_id)
            serializer = self.get_serializer(logs, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id is required'}, status=400)
