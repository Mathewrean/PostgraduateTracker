from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.users.models import User
from .models import Student, SupervisorOption, normalize_supervisor_name
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
    if instance.role_key in [
            'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']:
        resolve_pending_supervisor_option(instance)


def resolve_pending_supervisor_option(user):
    full_name = normalize_supervisor_name(user.get_full_name())
    if not full_name:
        return

    for option in SupervisorOption.objects.filter(
            is_other=False,
            role=user.role_key):
        if normalize_supervisor_name(option.name) == full_name:
            option.linked_user = user
            option.save(update_fields=['linked_user', 'updated_at'])
            Student.objects.filter(
                preferred_supervisor_option=option,
                preferred_supervisor__isnull=True).update(
                preferred_supervisor=user)
