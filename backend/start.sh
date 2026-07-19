#!/usr/bin/env bash
set -o errexit

echo "==> Applying database migrations"
python manage.py migrate --noinput

echo "==> Bootstrapping admin user (if ADMIN_EMAIL/ADMIN_PASSWORD set)"
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
U = get_user_model()
email = os.environ.get('ADMIN_EMAIL')
pw = os.environ.get('ADMIN_PASSWORD')
if email and pw:
    if U.objects.filter(email__iexact=email).exists():
        print('ADMIN: user already exists:', email)
    else:
        U.objects.create_superuser(email=email, phone=os.environ.get('ADMIN_PHONE') or '+0000000000', password=pw, is_active=True)
        print('ADMIN: created superuser:', email)
else:
    print('ADMIN: skipped (ADMIN_EMAIL/ADMIN_PASSWORD not set)')
"

echo "==> Collecting static files (runtime)"
python manage.py collectstatic --noinput || echo "collectstatic completed with warnings (non-fatal)"

echo "==> Starting gunicorn"
exec gunicorn pst_project.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
