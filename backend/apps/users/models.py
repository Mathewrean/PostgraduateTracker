from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


ROLE_NORMALIZATION_MAP = {
    'student': 'student',
    'supervisor': 'supervisor',
    'lecturer': 'supervisor',
    'coordinator': 'coordinator',
    'dean': 'dean',
    'cod': 'cod',
    'director_bps': 'director_bps',
    'director bps': 'director_bps',
    'STUDENT': 'student',
    'SUPERVISOR': 'supervisor',
    'LECTURER': 'supervisor',
    'COORDINATOR': 'coordinator',
    'DEAN': 'dean',
    'COD': 'cod',
    'DIRECTOR_BPS': 'director_bps',
    'DIRECTOR BPS': 'director_bps',
}


def normalize_role_value(value):
    if value is None:
        return 'student'
    cleaned = str(value).strip()
    return ROLE_NORMALIZATION_MAP.get(
        cleaned, ROLE_NORMALIZATION_MAP.get(
            cleaned.lower(), 'student'))


class UserManager(BaseUserManager):
    def create_user(
            self,
            email,
            admission_number=None,
            phone=None,
            password=None,
            **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not phone:
            raise ValueError('Phone number is required')
        email = self.normalize_email(email)
        extra_fields['role'] = normalize_role_value(
            extra_fields.get('role', 'student'))
        user = self.model(
            email=email,
            admission_number=admission_number,
            phone=phone,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)

        role = extra_fields['role']
        if role == 'student':
            from apps.students.models import Student
            from apps.stages.models import Stage

            student, _ = Student.objects.get_or_create(user=user)
            Stage.objects.get_or_create(student=student, stage_type='CONCEPT')
        elif role == 'supervisor':
            from apps.supervisors.models import Supervisor

            Supervisor.objects.get_or_create(
                user=user,
                defaults={'department': 'Pure and Applied Mathematics'}
            )
        return user

    def create_superuser(
            self,
            email,
            admission_number=None,
            phone=None,
            password=None,
            **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'dean')
        return self.create_user(
            email,
            admission_number,
            phone,
            password,
            **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('supervisor', 'Supervisor'),
        ('coordinator', 'Coordinator'),
        ('dean', 'Dean'),
        ('cod', 'COD'),
        ('director_bps', 'Director BPS'),
    )

    email = models.EmailField(unique=True)
    admission_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True)
    # Allow formatted numbers like +254 701 618 286
    phone = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student')
    is_active = models.BooleanField(default=True)
    email_notifications_enabled = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['admission_number']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def role_key(self):
        return normalize_role_value(self.role)

    def update_last_login(self, ip_address=None):
        self.last_login = timezone.now()
        self.last_login_ip = ip_address
        self.save(update_fields=['last_login', 'last_login_ip'])

    def save(self, *args, **kwargs):
        self.role = normalize_role_value(self.role)
        super().save(*args, **kwargs)


class EmailOTP(models.Model):
    OTP_PURPOSES = (
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='email_otp')
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=OTP_PURPOSES, default='registration')
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'email_otps'
        indexes = [
            models.Index(fields=['code'], name='email_otps_code_c4f8cb_idx'),
            models.Index(fields=['expires_at'], name='email_otps_expires_040e75_idx'),
            models.Index(fields=['purpose'], name='email_otps_purpose_idx'),
        ]

    @classmethod
    def expiry_time(cls):
        return timezone.now() + timedelta(minutes=10)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_used(self):
        return self.used_at is not None
