from rest_framework import serializers
from .models import Student, SupervisorOption
from apps.users.serializers import UserSerializer


class SupervisorOptionSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    linked_user_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = SupervisorOption
        fields = [
            'id',
            'name',
            'title',
            'role',
            'display_order',
            'display_name',
            'is_other',
            'linked_user_id',
        ]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_supervisor_email = serializers.SerializerMethodField()
    assigned_supervisor_name = serializers.SerializerMethodField()
    preferred_supervisor_name = serializers.SerializerMethodField()
    preferred_supervisor_option_detail = SupervisorOptionSerializer(
        source='preferred_supervisor_option',
        read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'project_title',
            'preferred_supervisor',
            'preferred_supervisor_option',
            'preferred_supervisor_option_detail',
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
        if obj.preferred_supervisor_option:
            return obj.preferred_supervisor_option.display_name
        if obj.preferred_supervisor_other:
            return obj.preferred_supervisor_other
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    preferred_supervisor_option = serializers.PrimaryKeyRelatedField(
        queryset=SupervisorOption.objects.all(),
        required=False,
        allow_null=True)

    class Meta:
        model = Student
        fields = [
            'project_title',
            'preferred_supervisor',
            'preferred_supervisor_option',
            'preferred_supervisor_other',
            'profile_complete']

    def validate(self, attrs):
        option = attrs.get('preferred_supervisor_option')
        other = attrs.get('preferred_supervisor_other', '')
        preferred_supervisor = attrs.get('preferred_supervisor')
        if option and option.is_other and not other.strip():
            raise serializers.ValidationError({
                'preferred_supervisor_other': 'Enter the supervisor name when selecting Any Other.'
            })
        if preferred_supervisor and option:
            raise serializers.ValidationError({
                'preferred_supervisor': 'Choose either a linked supervisor account or an official supervisor option.'
            })
        return attrs

    def update(self, instance, validated_data):
        option = validated_data.get('preferred_supervisor_option')
        if option:
            if option.is_other:
                validated_data['preferred_supervisor'] = None
            else:
                validated_data['preferred_supervisor'] = option.linked_user
                validated_data['preferred_supervisor_other'] = ''
        return super().update(instance, validated_data)
