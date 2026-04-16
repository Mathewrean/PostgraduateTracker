from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'admission_number', 'phone', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']

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
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone']
