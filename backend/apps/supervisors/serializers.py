from rest_framework import serializers
from .models import Supervisor
from apps.users.models import User

class SupervisorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Supervisor
        fields = ['id', 'email', 'full_name', 'department', 'specialisation', 'created_at']
        read_only_fields = ['id', 'email', 'full_name', 'created_at']

class SupervisorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supervisor
        fields = ['department', 'specialisation']