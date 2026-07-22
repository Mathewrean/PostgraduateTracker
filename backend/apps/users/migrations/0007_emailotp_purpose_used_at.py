from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_create_admin_from_env'),
    ]

    operations = [
        migrations.AddField(
            model_name='emailotp',
            name='purpose',
            field=models.CharField(
                choices=[('registration', 'Registration'), ('password_reset', 'Password Reset')],
                default='registration',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='emailotp',
            name='used_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
