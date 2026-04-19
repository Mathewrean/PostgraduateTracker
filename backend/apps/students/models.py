from django.db import models
from django.core.exceptions import ValidationError
from apps.users.models import User

# Removed SUPERVISOR_CHOICES as it's replaced by a ForeignKey with limit_choices_to

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    project_title = models.CharField(max_length=255, blank=True)
    
    # Changed from CharField with hardcoded choices to ForeignKey to User
    # Nullable to allow for 'Other' or no preferred supervisor initially
    preferred_supervisor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='students_preferred_by',
        limit_choices_to={'role': 'SUPERVISOR'} # Limit choices to supervisors
    )
    # Keeping preferred_supervisor_other for now, but its functionality might need review
    preferred_supervisor_other = models.CharField(max_length=255, blank=True, help_text='If no supervisor is selected or for custom entry')
    
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
