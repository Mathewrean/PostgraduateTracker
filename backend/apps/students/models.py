from django.db import models
from django.db.models import Q
from apps.users.models import User


OFFICIAL_SUPERVISOR_OPTIONS = [
    {
        'order': 1,
        'name': 'Professor Okello',
        'title': 'Dean',
        'role': 'dean',
        'is_other': False,
    },
    {
        'order': 2,
        'name': 'Dr. Prisca Magotu',
        'title': 'Chair of Department (COD)',
        'role': 'cod',
        'is_other': False,
    },
    {
        'order': 3,
        'name': 'Prof. Miner Titus',
        'title': '',
        'role': 'supervisor',
        'is_other': False,
    },
    {
        'order': 4,
        'name': 'Dr. Joseph Nyakinda',
        'title': '',
        'role': 'supervisor',
        'is_other': False,
    },
    {
        'order': 5,
        'name': 'Dr. Willy Kangojo',
        'title': 'Coordinator',
        'role': 'coordinator',
        'is_other': False,
    },
    {
        'order': 6,
        'name': 'Dr. Julius Owino',
        'title': '',
        'role': 'supervisor',
        'is_other': False,
    },
    {
        'order': 7,
        'name': 'Dr. Francis Akwenda Odhiambo',
        'title': '',
        'role': 'supervisor',
        'is_other': False,
    },
    {
        'order': 8,
        'name': 'Director, BPS',
        'title': '',
        'role': 'director_bps',
        'is_other': False,
    },
    {
        'order': 9,
        'name': 'Any Other',
        'title': 'free text input appears when selected',
        'role': '',
        'is_other': True,
    },
]


def normalize_supervisor_name(value):
    return ' '.join(str(value or '').replace(',', '').lower().split())


class SupervisorOption(models.Model):
    name = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, blank=True)
    display_order = models.PositiveSmallIntegerField(unique=True)
    is_other = models.BooleanField(default=False)
    linked_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervisor_options')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'supervisor_options'
        ordering = ['display_order']
        indexes = [
            models.Index(
                fields=['display_order'],
                name='supervisor__display_6f646c_idx'),
            models.Index(fields=['role'], name='supervisor__role_bebd30_idx'),
        ]

    def __str__(self):
        if self.title:
            return f'{self.name} - {self.title}'
        return self.name

    @property
    def display_name(self):
        if self.title:
            return f'{self.name} - {self.title}'
        return self.name


class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile')
    project_title = models.CharField(max_length=255, blank=True)
    preferred_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to=Q(
            role__in=['supervisor', 'coordinator', 'dean', 'cod', 'director_bps']),
        related_name='preferred_by')
    preferred_supervisor_option = models.ForeignKey(
        SupervisorOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students_pending_preference')
    preferred_supervisor_other = models.CharField(
        max_length=255,
        blank=True,
        help_text='If no supervisor is selected from the list or for custom entry')

    assigned_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students_assigned')
    current_stage = models.CharField(max_length=20, default='CONCEPT', choices=[
        ('CONCEPT', 'Concept'),
        ('PROPOSAL', 'Proposal'),
        ('THESIS', 'Thesis Submission'),
        ('COMPLETED', 'Completed'),
    ])
    profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['current_stage']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.current_stage}"

    @property
    def preferred_supervisor_display_name(self):
        if self.preferred_supervisor:
            return self.preferred_supervisor.get_full_name() or self.preferred_supervisor.email
        elif self.preferred_supervisor_option:
            return self.preferred_supervisor_option.display_name
        elif self.preferred_supervisor_other:
            return self.preferred_supervisor_other
        return None
