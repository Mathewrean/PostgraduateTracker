from rest_framework import serializers
from .models import Student, Supervisor
from apps.users.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_supervisor_email = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'user', 'project_title', 'preferred_supervisor', 'preferred_supervisor_other', 
                  'assigned_supervisor', 'assigned_supervisor_email', 'current_stage', 'profile_complete', 'created_at']
        read_only_fields = ['created_at', 'current_stage']

    def get_assigned_supervisor_email(self, obj):
        if obj.assigned_supervisor:
            return obj.assigned_supervisor.email
        return None

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['project_title', 'preferred_supervisor', 'preferred_supervisor_other', 'profile_complete']

class SupervisorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Supervisor
        fields = ['id', 'user', 'department', 'specialisation', 'created_at']
        read_only_fields = ['created_at']
