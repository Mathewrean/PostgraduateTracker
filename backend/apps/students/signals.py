from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.users.models import User
from .models import Student, Supervisor

@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'STUDENT':
        Student.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def create_supervisor_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'SUPERVISOR':
        Supervisor.objects.get_or_create(user=instance)
