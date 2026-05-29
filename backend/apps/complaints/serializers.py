from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    responded_by_email = serializers.SerializerMethodField()
    approval_trail = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id',
            'student',
            'student_email',
            'content',
            'submitted_at',
            'status',
            'response_content',
            'responded_at',
            'responded_by',
            'responded_by_email',
            'approval_trail',
            'is_overdue']
        read_only_fields = [
            'submitted_at',
            'responded_at',
            'approval_trail',
            'is_overdue']

    def get_student_email(self, obj):
        request = self.context.get('request')
        if request and request.user.role_key == 'student':
            return None
        return obj.student.user.email

    def get_responded_by_email(self, obj):
        request = self.context.get('request')
        if request and request.user.role_key == 'student':
            return None
        return obj.responded_by.email if obj.responded_by else None

    def get_approval_trail(self, obj):
        request = self.context.get('request')
        trail = obj.approval_trail or []
        if request and request.user.role_key == 'student':
            redacted = []
            for entry in trail:
                redacted.append({
                    'actor_role': entry.get('actor_role') or 'administration',
                    'action': entry.get('action'),
                    'timestamp': entry.get('timestamp'),
                    'signature': entry.get('signature', ''),
                    'comment': entry.get('comment', ''),
                })
            return redacted
        return trail

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.role_key == 'student':
            data.pop('student', None)
            data.pop('student_email', None)
            data.pop('responded_by', None)
            data.pop('responded_by_email', None)
        return data
