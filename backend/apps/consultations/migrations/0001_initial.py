from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('stages', '0003_stage_created_at_stage_updated_at'),
        ('students', '0006_supervisoroption_student_preferred_option'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConsultationForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('form_type', models.CharField(choices=[('monthly', 'Monthly'), ('bimonthly', 'Bimonthly')], max_length=20)),
                ('consultation_date', models.DateField()),
                ('topics_discussed', models.TextField()),
                ('decisions_made', models.TextField()),
                ('action_items', models.TextField()),
                ('submitted_at', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('submitted', 'Submitted'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='draft', max_length=20)),
                ('approval_trail', models.JSONField(blank=True, default=list)),
                ('minutes_file', models.FileField(blank=True, null=True, upload_to='consultation_minutes/%Y/%m/%d/')),
                ('minutes_uploaded_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('minutes_uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='uploaded_consultation_minutes', to=settings.AUTH_USER_MODEL)),
                ('stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultation_forms', to='stages.stage')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultation_forms', to='students.student')),
                ('supervisor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='consultation_forms', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'consultation_forms',
                'ordering': ['-consultation_date', '-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='consultationform',
            index=models.Index(fields=['student', 'stage'], name='consultatio_student_74d560_idx'),
        ),
        migrations.AddIndex(
            model_name='consultationform',
            index=models.Index(fields=['supervisor', 'status'], name='consultatio_supervi_e14c55_idx'),
        ),
        migrations.AddIndex(
            model_name='consultationform',
            index=models.Index(fields=['status'], name='consultatio_status_90dccd_idx'),
        ),
    ]
