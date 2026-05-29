from django.db import migrations, models


def backfill_complaint_trails(apps, schema_editor):
    Complaint = apps.get_model('complaints', 'Complaint')
    for complaint in Complaint.objects.all():
        responder_name = 'Department Administration'
        responder_role = 'administration'
        if complaint.responded_by_id:
            first_name = getattr(complaint.responded_by, 'first_name', '') or ''
            last_name = getattr(complaint.responded_by, 'last_name', '') or ''
            responder_name = ' '.join(
                [first_name, last_name]).strip() or complaint.responded_by.email
            responder_role = complaint.responded_by.role

        trail = complaint.approval_trail or []
        if not trail:
            trail.append({
                'actor_name': 'System',
                'actor_role': 'system',
                'action': 'received',
                'timestamp': complaint.submitted_at.isoformat(),
                'signature': '',
                'comment': '',
            })
            if complaint.response_content:
                trail.append({
                    'actor_name': responder_name,
                    'actor_role': responder_role,
                    'action': 'responded',
                    'timestamp': complaint.responded_at.isoformat() if complaint.responded_at else complaint.submitted_at.isoformat(),
                    'signature': '',
                    'comment': '',
                })
            complaint.approval_trail = trail
            complaint.save(update_fields=['approval_trail'])


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0003_complaint_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='approval_trail',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(backfill_complaint_trails, migrations.RunPython.noop),
    ]
