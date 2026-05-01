from apps.audit.models import AuditLog


def log_audit_event(
    *,
    user,
    action,
    description,
    ip_address=None,
        extra_data=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        description=description,
        ip_address=ip_address,
        extra_data=extra_data or {},
    )
