from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.users.models import User
from .models import Student
from apps.stages.models import Stage
from apps.supervisors.models import Supervisor


@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role_key == 'student':
        student, _ = Student.objects.get_or_create(user=instance)
        Stage.objects.get_or_create(student=student, stage_type='CONCEPT')


@receiver(post_save, sender=User)
def create_supervisor_profile(sender, instance, created, **kwargs):
    if created and instance.role_key == 'supervisor':
        Supervisor.objects.get_or_create(
            user=instance,
            defaults={'department': 'Pure and Applied Mathematics'}
        )
