from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'timestamp', 'ip_address']
    list_filter = ['timestamp', 'action']
    search_fields = ['user__email', 'description', 'ip_address']
    readonly_fields = ['timestamp', 'extra_data']
