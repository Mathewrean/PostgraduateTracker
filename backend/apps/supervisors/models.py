from django.db import models
from apps.users.models import User

class Supervisor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    department = models.CharField(max_length=100)
    specialisation = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.email

    class Meta:
        verbose_name = "Supervisor"
        verbose_name_plural = "Supervisors"
        ordering = ['user__first_name', 'user__last_name']
