from rest_framework import serializers
from .models import Student
from apps.users.serializers import UserSerializer


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_supervisor_email = serializers.SerializerMethodField()
    assigned_supervisor_name = serializers.SerializerMethodField()
    preferred_supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'project_title',
            'preferred_supervisor',
            'preferred_supervisor_name',
            'preferred_supervisor_other',
            'assigned_supervisor',
            'assigned_supervisor_email',
            'assigned_supervisor_name',
            'current_stage',
            'profile_complete',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'current_stage', 'updated_at']

    def get_assigned_supervisor_email(self, obj):
        if obj.assigned_supervisor:
            return obj.assigned_supervisor.email
        return None

    def get_assigned_supervisor_name(self, obj):
        if obj.assigned_supervisor:
            return obj.assigned_supervisor.get_full_name() or obj.assigned_supervisor.email
        return None

    def get_preferred_supervisor_name(self, obj):
        if obj.preferred_supervisor:
            return obj.preferred_supervisor.get_full_name() or obj.preferred_supervisor.email
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'project_title',
            'preferred_supervisor',
            'preferred_supervisor_other',
            'profile_complete']
