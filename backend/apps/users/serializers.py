from rest_framework import serializers
from .models import User, normalize_role_value
from apps.students.models import SupervisorOption


class UserSerializer(serializers.ModelSerializer):
    current_stage = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    profile_complete = serializers.SerializerMethodField()
    preferred_supervisor = serializers.SerializerMethodField()
    preferred_supervisor_option = serializers.SerializerMethodField()
    preferred_supervisor_other = serializers.SerializerMethodField()
    preferred_supervisor_name = serializers.SerializerMethodField()
    assigned_supervisor_id = serializers.SerializerMethodField()
    assigned_supervisor_name = serializers.SerializerMethodField()
    assigned_supervisor_email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'admission_number',
            'phone',
            'first_name',
            'last_name',
            'role',
            'is_active',
            'email_notifications_enabled',
            'date_joined',
            'last_login',
            'current_stage',
            'project_title',
            'profile_complete',
            'preferred_supervisor',
            'preferred_supervisor_option',
            'preferred_supervisor_name',
            'preferred_supervisor_other',
            'assigned_supervisor_id',
            'assigned_supervisor_name',
            'assigned_supervisor_email',
            'updated_at',
        ]
        read_only_fields = ['date_joined', 'last_login', 'updated_at']

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
        if student and student.preferred_supervisor:
            return student.preferred_supervisor.id
        return None

    def get_preferred_supervisor_option(self, obj):
        student = self._get_student_profile(obj)
        if student and student.preferred_supervisor_option_id:
            return student.preferred_supervisor_option_id
        return None

    def get_preferred_supervisor_other(self, obj):
        student = self._get_student_profile(obj)
        return student.preferred_supervisor_other if student else ''

    def get_preferred_supervisor_name(self, obj):
        student = self._get_student_profile(obj)
        if student and student.preferred_supervisor:
            return student.preferred_supervisor.get_full_name() or student.preferred_supervisor.email
        if student and student.preferred_supervisor_option:
            return student.preferred_supervisor_option.display_name
        if student and student.preferred_supervisor_other:
            return student.preferred_supervisor_other
        return None

    def get_assigned_supervisor_id(self, obj):
        student = self._get_student_profile(obj)
        return student.assigned_supervisor_id if student and student.assigned_supervisor_id else None

    def get_assigned_supervisor_name(self, obj):
        student = self._get_student_profile(obj)
        if student and student.assigned_supervisor:
            return student.assigned_supervisor.get_full_name(
            ) or student.assigned_supervisor.email
        return None

    def get_assigned_supervisor_email(self, obj):
        student = self._get_student_profile(obj)
        if student and student.assigned_supervisor:
            return student.assigned_supervisor.email
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text="Minimum 8 characters")
    password_confirm = serializers.CharField(
        write_only=True, min_length=8, help_text="Must match password")

    class Meta:
        model = User
        fields = [
            'email',
            'full_name',
            'admission_number',
            'phone',
            'first_name',
            'last_name',
            'role',
            'password',
            'password_confirm']
        extra_kwargs = {
            'email': {'required': True},
            'admission_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'phone': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'A user with this email already exists.')
        return User.objects.normalize_email(value)

    def validate_phone(self, value):
        if User.objects.filter(phone__iexact=value).exists():
            raise serializers.ValidationError(
                'A user with this phone number already exists.')
        return value

    def validate_admission_number(self, value):
        if value and User.objects.filter(admission_number__iexact=value).exists():
            raise serializers.ValidationError(
                'A user with this admission number already exists.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password': 'Passwords do not match'})
        role = normalize_role_value(attrs.get('role', 'student'))
        attrs['role'] = role
        admission_number = attrs.get('admission_number')
        if role == 'student' and not admission_number:
            raise serializers.ValidationError(
                {'admission_number': 'Admission number is required for students.'})
        if role == 'supervisor':
            attrs['admission_number'] = None
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '').strip()
        if full_name and not (
                validated_data.get('first_name') or validated_data.get('last_name')):
            parts = full_name.split()
            validated_data['first_name'] = parts[0]
            validated_data['last_name'] = ' '.join(parts[1:])
        # Set defaults for optional fields
        validated_data.setdefault('first_name', '')
        validated_data.setdefault('last_name', '')
        validated_data.setdefault('role', 'student')
        validated_data['is_active'] = False
        return User.objects.create_user(**validated_data)


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'admission_number',
            'phone',
            'first_name',
            'last_name',
            'role',
            'is_active',
            'email_notifications_enabled',
            'date_joined',
            'last_login',
            'last_login_ip']
        read_only_fields = ['date_joined', 'last_login', 'last_login_ip']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(required=False, allow_blank=True)
    preferred_supervisor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            role__in=['supervisor', 'coordinator', 'dean', 'cod', 'director_bps']),
        required=False,
        allow_null=True)
    preferred_supervisor_option = serializers.PrimaryKeyRelatedField(
        queryset=SupervisorOption.objects.all(),
        required=False,
        allow_null=True)
    preferred_supervisor_other = serializers.CharField(
        required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'phone',
            'email_notifications_enabled',
            'project_title',
            'preferred_supervisor',
            'preferred_supervisor_option',
            'preferred_supervisor_other']

    def update(self, instance, validated_data):
        project_title = validated_data.pop('project_title', None)
        preferred_supervisor = validated_data.pop('preferred_supervisor', None)
        preferred_supervisor_option = validated_data.pop(
            'preferred_supervisor_option', None)
        preferred_supervisor_other = validated_data.pop(
            'preferred_supervisor_other', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        student = getattr(instance, 'student_profile', None)
        if student:
            if project_title is not None:
                student.project_title = project_title
            if preferred_supervisor is not None:
                student.preferred_supervisor = preferred_supervisor
                student.preferred_supervisor_option = None
                if preferred_supervisor:
                    student.preferred_supervisor_other = ''
            if preferred_supervisor_option is not None:
                student.preferred_supervisor_option = preferred_supervisor_option
                if preferred_supervisor_option.is_other:
                    student.preferred_supervisor = None
                else:
                    student.preferred_supervisor = preferred_supervisor_option.linked_user
                    student.preferred_supervisor_other = ''
            if preferred_supervisor_other is not None:
                student.preferred_supervisor_other = preferred_supervisor_other.strip()
                if student.preferred_supervisor_other:
                    student.preferred_supervisor = None
                    if not (
                            student.preferred_supervisor_option and
                            student.preferred_supervisor_option.is_other):
                        student.preferred_supervisor_option = None
            student.profile_complete = bool(
                student.project_title and (
                    student.preferred_supervisor or
                    student.preferred_supervisor_option or
                    student.preferred_supervisor_other))
            student.save()

        return instance
