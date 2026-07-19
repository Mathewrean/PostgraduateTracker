#!/usr/bin/env bash
set -o errexit

echo "==> Applying database migrations"
python manage.py migrate --noinput

echo "==> Collecting static files (runtime)"
python manage.py collectstatic --noinput || echo "collectstatic completed with warnings (non-fatal)"

echo "==> Starting gunicorn"
exec gunicorn pst_project.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
