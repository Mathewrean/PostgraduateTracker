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

    def _require_audit_access(self):
        if self.request.user.role_key not in ['dean', 'cod', 'director_bps']:
            raise PermissionDenied(
                'Only the Dean, COD, and Director BPS can access audit logs.')

    def get_queryset(self):
        self._require_audit_access()
        return AuditLog.objects.all()

    def list(self, request, *args, **kwargs):
        self._require_audit_access()
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        self._require_audit_access()
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def user_logs(self, request):
        self._require_audit_access()
        user_id = request.query_params.get('user_id')
        if user_id:
            logs = self.get_queryset().filter(user_id=user_id)
            serializer = self.get_serializer(logs, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id is required'}, status=400)
