from rest_framework import serializers
from .models import Stage

class StageSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    assigned_supervisor_email = serializers.SerializerMethodField()

    class Meta:
        model = Stage
        fields = ['id', 'student', 'student_email', 'stage_type', 'status', 'started_at', 'completed_at', 
                  'approved_by', 'assigned_supervisor_email', 'approval_date', 'thesis_submission_date', 
                  'three_month_unlock_date']
        read_only_fields = ['started_at', 'completed_at', 'approval_date', 'three_month_unlock_date']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_assigned_supervisor_email(self, obj):
        if obj.student.assigned_supervisor:
            return obj.student.assigned_supervisor.email
        return None
