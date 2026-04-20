from rest_framework import serializers
from .models import User
from apps.students.models import Student

class UserSerializer(serializers.ModelSerializer):
    current_stage = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    profile_complete = serializers.SerializerMethodField()
    preferred_supervisor = serializers.SerializerMethodField()
    preferred_supervisor_other = serializers.SerializerMethodField()
    assigned_supervisor_id = serializers.SerializerMethodField()
    assigned_supervisor_name = serializers.SerializerMethodField()
    assigned_supervisor_email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'admission_number', 'phone', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login', 'current_stage',
            'project_title', 'profile_complete', 'preferred_supervisor',
            'preferred_supervisor_other', 'assigned_supervisor_id',
            'assigned_supervisor_name', 'assigned_supervisor_email',
        ]
        read_only_fields = ['date_joined', 'last_login']

    def _get_student_profile(self, obj):
        return getattr(obj, 'student_profile', None)

    def get_current_stage(self, obj):
        student = self._get_student_profile(obj)
        return student.current_stage if student else None

    def get_project_title(self, obj):
        student = self._get_student_profile(obj)
        return student.project_title if student else ''

    def get_profile_complete(self, obj):
        student = self._get_student_profile(obj)
        return student.profile_complete if student else True

    def get_preferred_supervisor(self, obj):
        student = self._get_student_profile(obj)
        return student.preferred_supervisor if student else ''

    def get_preferred_supervisor_other(self, obj):
        student = self._get_student_profile(obj)
        return student.preferred_supervisor_other if student else ''

    def get_assigned_supervisor_id(self, obj):
        student = self._get_student_profile(obj)
        return student.assigned_supervisor_id if student and student.assigned_supervisor_id else None

    def get_assigned_supervisor_name(self, obj):
        student = self._get_student_profile(obj)
        if student and student.assigned_supervisor:
            return student.assigned_supervisor.get_full_name() or student.assigned_supervisor.email
        return None

    def get_assigned_supervisor_email(self, obj):
        student = self._get_student_profile(obj)
        if student and student.assigned_supervisor:
            return student.assigned_supervisor.email
        return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, help_text="Minimum 8 characters")
    password_confirm = serializers.CharField(write_only=True, min_length=8, help_text="Must match password")

    class Meta:
        model = User
        fields = ['email', 'admission_number', 'phone', 'first_name', 'last_name', 'role', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True},
            'admission_number': {'required': True},
            'phone': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        # Set defaults for optional fields
        validated_data.setdefault('first_name', '')
        validated_data.setdefault('last_name', '')
        validated_data.setdefault('role', 'STUDENT')
        return User.objects.create_user(**validated_data)

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'admission_number', 'phone', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'last_login', 'last_login_ip']
        read_only_fields = ['date_joined', 'last_login', 'last_login_ip']

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(required=False, allow_blank=True)
    preferred_supervisor = serializers.CharField(required=False, allow_blank=True)
    preferred_supervisor_other = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'project_title', 'preferred_supervisor', 'preferred_supervisor_other']
