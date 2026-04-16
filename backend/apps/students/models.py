from django.db import models
from django.core.exceptions import ValidationError
from apps.users.models import User

SUPERVISOR_CHOICES = [
    ('Dr. Michael Kipchoge', 'Dr. Michael Kipchoge'),
    ('Prof. Jane Njeri', 'Prof. Jane Njeri'),
    ('Dr. James Omondi', 'Dr. James Omondi'),
    ('Dr. Sarah Mwangi', 'Dr. Sarah Mwangi'),
    ('Prof. David Kiplagat', 'Prof. David Kiplagat'),
    ('Dr. Grace Kariuki', 'Dr. Grace Kariuki'),
    ('Dr. Robert Kimani', 'Dr. Robert Kimani'),
    ('Dr. Alice Ochieng', 'Dr. Alice Ochieng'),
    ('OTHER', 'Other (Please specify)'),
]

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    project_title = models.CharField(max_length=255, blank=True)
    preferred_supervisor = models.CharField(max_length=255, choices=SUPERVISOR_CHOICES, blank=True)
    preferred_supervisor_other = models.CharField(max_length=255, blank=True, help_text='If OTHER is selected above')
    assigned_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='students_assigned')
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

class Supervisor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='supervisor_profile')
    department = models.CharField(max_length=255, blank=True)
    specialisation = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'supervisors'

    def __str__(self):
        return f"{self.user.email} - {self.specialisation}"
