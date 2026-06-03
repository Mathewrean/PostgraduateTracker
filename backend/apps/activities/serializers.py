from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField()
    marked_done_by_email = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    supervisor_email = serializers.SerializerMethodField()
    stage_type = serializers.SerializerMethodField()
    stage_status = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id',
            'stage',
            'created_by',
            'created_by_email',
            'title',
            'description',
            'planned_date',
            'completed_date',
            'status',
            'marked_done_by',
            'marked_done_by_email',
            'student_name',
            'student_email',
            'supervisor_name',
            'supervisor_email',
            'stage_type',
            'stage_status',
            'notes',
            'created_at',
            'updated_at']
        read_only_fields = ['completed_date', 'marked_done_by', 'created_at', 'updated_at']

    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None

    def get_marked_done_by_email(self, obj):
        return obj.marked_done_by.email if obj.marked_done_by else None

    def get_student_name(self, obj):
        user = obj.stage.student.user
        return user.get_full_name() or user.email

    def get_student_email(self, obj):
        return obj.stage.student.user.email

    def get_supervisor_name(self, obj):
        supervisor = obj.stage.student.assigned_supervisor
        if supervisor:
            return supervisor.get_full_name() or supervisor.email
        return None

    def get_supervisor_email(self, obj):
        supervisor = obj.stage.student.assigned_supervisor
        return supervisor.email if supervisor else None

    def get_stage_type(self, obj):
        return obj.stage.stage_type

    def get_stage_status(self, obj):
        return obj.stage.status

    def get_notes(self, obj):
        return obj.description
