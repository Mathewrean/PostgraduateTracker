from rest_framework import serializers
from .models import Stage
from apps.activities.serializers import ActivitySerializer
from apps.documents.serializers import DocumentSerializer, MinutesSerializer


class StageSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    assigned_supervisor_email = serializers.SerializerMethodField()
    activities = ActivitySerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    minutes = serializers.SerializerMethodField()
    missing_document_types = serializers.SerializerMethodField()
    incomplete_activities = serializers.SerializerMethodField()
    minutes_approved = serializers.SerializerMethodField()

    class Meta:
        model = Stage
        fields = [
            'id',
            'student',
            'student_email',
            'stage_type',
            'status',
            'started_at',
            'completed_at',
            'approved_by',
            'assigned_supervisor_email',
            'approval_date',
            'thesis_submission_date',
            'three_month_unlock_date',
            'activities',
            'documents',
            'minutes',
            'missing_document_types',
            'incomplete_activities',
            'minutes_approved']
        read_only_fields = [
            'started_at',
            'completed_at',
            'approval_date',
            'three_month_unlock_date']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_assigned_supervisor_email(self, obj):
        if obj.student.assigned_supervisor:
            return obj.student.assigned_supervisor.email
        return None

    def get_minutes(self, obj):
        if hasattr(obj, 'minutes'):
            return MinutesSerializer(obj.minutes, context=self.context).data
        return None

    def get_missing_document_types(self, obj):
        return obj.missing_document_types()

    def get_incomplete_activities(self, obj):
        return obj.incomplete_activity_titles()

    def get_minutes_approved(self, obj):
        return obj.minutes_approved()
