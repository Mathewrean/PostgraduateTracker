from django.db import models
from apps.users.models import User


class Supervisor(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='supervisor_profile')
    # Changed max_length to 100 as per checklist
    department = models.CharField(max_length=100)
    specialisation = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Added updated_at for consistency, though not explicitly required by
    # checklist
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'supervisors'
        verbose_name = "Supervisor"
        verbose_name_plural = "Supervisors"
        # Added ordering for consistency
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return self.user.get_full_name() or self.user.email
