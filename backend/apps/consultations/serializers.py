from rest_framework import serializers

from .models import ConsultationForm


class ConsultationFormSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    stage_type = serializers.SerializerMethodField()
    minutes_file = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationForm
        fields = [
            'id',
            'student',
            'student_email',
            'supervisor',
            'supervisor_name',
            'stage',
            'stage_type',
            'form_type',
            'consultation_date',
            'topics_discussed',
            'decisions_made',
            'action_items',
            'submitted_at',
            'status',
            'approval_trail',
            'minutes_file',
            'minutes_uploaded_by',
            'minutes_uploaded_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'student',
            'supervisor',
            'submitted_at',
            'status',
            'approval_trail',
            'minutes_uploaded_by',
            'minutes_uploaded_at',
            'created_at',
            'updated_at',
        ]

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_supervisor_name(self, obj):
        if not obj.supervisor:
            return None
        return obj.supervisor.get_full_name() or obj.supervisor.email

    def get_stage_type(self, obj):
        return obj.stage.stage_type

    def get_minutes_file(self, obj):
        if not obj.minutes_file:
            return None
        request = self.context.get('request')
        url = obj.minutes_file.url
        return request.build_absolute_uri(url) if request else url
