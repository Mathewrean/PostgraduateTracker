from django.db import models
from django.core.exceptions import ValidationError
from apps.users.models import User

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    project_title = models.CharField(max_length=255, blank=True)
    preferred_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'supervisor'}, related_name='preferred_by')
    preferred_supervisor_other = models.CharField(max_length=255, blank=True, help_text='If no supervisor is selected from the list or for custom entry')
    
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

    @property
    def preferred_supervisor_display_name(self):
        if self.preferred_supervisor:
            return self.preferred_supervisor.get_full_name() or self.preferred_supervisor.email
        elif self.preferred_supervisor_other:
            return self.preferred_supervisor_other
        return None
