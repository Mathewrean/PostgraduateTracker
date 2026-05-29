from django.db import migrations, models
import django.db.models.deletion


SUPERVISOR_OPTIONS = [
    (1, 'Professor Okello', 'Dean', 'dean', False),
    (2, 'Dr. Prisca Magotu', 'Chair of Department (COD)', 'cod', False),
    (3, 'Prof. Miner Titus', '', 'supervisor', False),
    (4, 'Dr. Joseph Nyakinda', '', 'supervisor', False),
    (5, 'Dr. Willy Kangojo', 'Coordinator', 'coordinator', False),
    (6, 'Dr. Julius Owino', '', 'supervisor', False),
    (7, 'Dr. Francis Akwenda Odhiambo', '', 'supervisor', False),
    (8, 'Director, BPS', '', 'director_bps', False),
    (9, 'Any Other', 'free text input appears when selected', '', True),
]


def seed_supervisor_options(apps, schema_editor):
    SupervisorOption = apps.get_model('students', 'SupervisorOption')
    for order, name, title, role, is_other in SUPERVISOR_OPTIONS:
        SupervisorOption.objects.update_or_create(
            display_order=order,
            defaults={
                'name': name,
                'title': title,
                'role': role,
                'is_other': is_other,
            },
        )


def unseed_supervisor_options(apps, schema_editor):
    SupervisorOption = apps.get_model('students', 'SupervisorOption')
    SupervisorOption.objects.filter(
        display_order__in=[option[0] for option in SUPERVISOR_OPTIONS]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_updated_at'),
        ('students', '0005_alter_student_preferred_supervisor'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupervisorOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('role', models.CharField(blank=True, max_length=20)),
                ('display_order', models.PositiveSmallIntegerField(unique=True)),
                ('is_other', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('linked_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='supervisor_options', to='users.user')),
            ],
            options={
                'db_table': 'supervisor_options',
                'ordering': ['display_order'],
            },
        ),
        migrations.AddField(
            model_name='student',
            name='preferred_supervisor_option',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students_pending_preference', to='students.supervisoroption'),
        ),
        migrations.AddIndex(
            model_name='supervisoroption',
            index=models.Index(fields=['display_order'], name='supervisor__display_6f646c_idx'),
        ),
        migrations.AddIndex(
            model_name='supervisoroption',
            index=models.Index(fields=['role'], name='supervisor__role_bebd30_idx'),
        ),
        migrations.RunPython(seed_supervisor_options, unseed_supervisor_options),
    ]
