#!/bin/bash

# PST Project Initialization Script

echo "=== Postgraduate Submissions Tracker (PST) ==="
echo "Initializing project..."

# Backend setup
cd backend

echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Copying .env file..."
cp .env.example .env

echo "Running Django migrations..."
python manage.py migrate

echo "Creating superuser..."
python manage.py createsuperuser

# Frontend setup
cd ../frontend

echo "Installing Node dependencies..."
npm install

echo "=== Setup Complete ==="
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Celery (optional): celery -A pst_project worker -l info"
echo ""
echo "Access the application at http://localhost:5173"
