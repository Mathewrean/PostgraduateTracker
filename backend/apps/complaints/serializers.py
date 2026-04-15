from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    responded_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = ['id', 'student', 'student_email', 'content', 'submitted_at', 'status', 
                  'response_content', 'responded_at', 'responded_by', 'responded_by_email', 'is_overdue']
        read_only_fields = ['submitted_at', 'responded_at', 'is_overdue']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_responded_by_email(self, obj):
        return obj.responded_by.email if obj.responded_by else None
