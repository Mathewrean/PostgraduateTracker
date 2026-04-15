from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'action', 'description', 'ip_address', 'timestamp', 'extra_data']
        read_only_fields = ['timestamp']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'System'
