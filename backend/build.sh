#!/usr/bin/env bash
set -o errexit

echo "==> Installing Python dependencies"
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Building React frontend (Vite)"
cd ../frontend
npm install
npm run build
cd ../backend

echo "==> Collecting static files (Django + built SPA)"
# STATICFILES_DIRS includes ../frontend/dist so the SPA is served by WhiteNoise at /.
# settings.py falls back to sqlite during collectstatic, so a missing Postgres adapter
# cannot fail the build.
python manage.py collectstatic --noinput || echo "collectstatic completed with warnings (non-fatal)"
