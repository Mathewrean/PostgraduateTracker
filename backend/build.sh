#!/usr/bin/env bash
set -o errexit

echo "==> Installing Python dependencies"
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Collecting static files (tolerant of missing Postgres adapter)"
# collectstatic must not fail the build if psycopg/DB is unavailable.
# settings.py falls back to sqlite during collectstatic, so this is safe.
python manage.py collectstatic --noinput || echo "collectstatic completed with warnings (non-fatal)"
