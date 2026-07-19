from django.db import migrations


def create_admin_from_env(apps, schema_editor):
    import os
    import logging

    logger = logging.getLogger(__name__)
    email = os.environ.get('ADMIN_EMAIL')
    password = os.environ.get('ADMIN_PASSWORD')
    if not (email and password):
        # No admin credentials configured; skip. Set ADMIN_EMAIL/ADMIN_PASSWORD
        # in the Render environment to provision a superuser on next deploy.
        return

    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        if User.objects.filter(email__iexact=email).exists():
            return

        phone = os.environ.get('ADMIN_PHONE') or '+0000000000'
        User.objects.create_superuser(
            email=email,
            phone=phone,
            password=password,
            is_active=True,
        )
        logger.info('Admin superuser provisioned: %s', email)
    except Exception as exc:
        # Never let admin provisioning break the whole deploy.
        logger.error('Admin provisioning failed (non-fatal): %s', exc)


def reverse_create_admin(apps, schema_editor):
    import os
    from django.contrib.auth import get_user_model

    email = os.environ.get('ADMIN_EMAIL')
    if not email:
        return
    User = get_user_model()
    User.objects.filter(email__iexact=email).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_user_email_notifications_enabled'),
    ]

    operations = [
        migrations.RunPython(create_admin_from_env, reverse_create_admin),
    ]
