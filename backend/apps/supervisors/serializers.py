from rest_framework import serializers
from .models import Supervisor
from apps.students.models import Student


class SupervisorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(
        source='user.get_full_name', read_only=True)

    class Meta:
        model = Supervisor
        fields = [
            'id',
            'email',
            'full_name',
            'department',
            'specialisation',
            'created_at']
        read_only_fields = ['id', 'email', 'full_name', 'created_at']


class SupervisorProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email')
    phone = serializers.CharField(source='user.phone')
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    role = serializers.CharField(source='user.role', read_only=True)
    assigned_student_ids = serializers.SerializerMethodField()

    class Meta:
        model = Supervisor
        fields = [
            'id',
            'email',
            'phone',
            'first_name',
            'last_name',
            'role',
            'department',
            'specialisation',
            'assigned_student_ids',
        ]

    def get_assigned_student_ids(self, obj):
        return list(Student.objects.filter(
            assigned_supervisor=obj.user
        ).values_list('id', flat=True))

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
