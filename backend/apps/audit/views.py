from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
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
        queryset = AuditLog.objects.all().order_by('-timestamp')
        user_id = self.request.query_params.get('user_id')
        from_value = self.request.query_params.get('from')
        to_value = self.request.query_params.get('to')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if from_value:
            parsed_from = parse_datetime(from_value) or parse_date(from_value)
            if parsed_from:
                if not hasattr(parsed_from, 'hour'):
                    parsed_from = timezone.datetime.combine(
                        parsed_from,
                        timezone.datetime.min.time(),
                    )
                if timezone.is_naive(parsed_from):
                    parsed_from = timezone.make_aware(parsed_from)
                queryset = queryset.filter(timestamp__gte=parsed_from)
        if to_value:
            parsed_to = parse_datetime(to_value) or parse_date(to_value)
            if parsed_to:
                if not hasattr(parsed_to, 'hour'):
                    parsed_to = timezone.datetime.combine(
                        parsed_to,
                        timezone.datetime.max.time(),
                    )
                if timezone.is_naive(parsed_to):
                    parsed_to = timezone.make_aware(parsed_to)
                queryset = queryset.filter(timestamp__lte=parsed_to)
        return queryset

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
