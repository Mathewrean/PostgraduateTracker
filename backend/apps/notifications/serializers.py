from rest_framework import serializers
from .models import Notification
from apps.activities.models import Meeting

class NotificationSerializer(serializers.ModelSerializer):
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'recipient_email', 'message', 'notification_type', 'is_read', 'created_at', 'link']
        read_only_fields = ['created_at']

    def get_recipient_email(self, obj):
        return obj.recipient.email

class MeetingSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    supervisor_email = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = ['id', 'student', 'student_email', 'supervisor', 'supervisor_email', 
                  'scheduled_date', 'status', 'notes', 'created_at']
        read_only_fields = ['created_at']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_supervisor_email(self, obj):
        return obj.supervisor.email
