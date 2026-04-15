# Windows PowerShell Setup Script

Write-Host "=== Postgraduate Submissions Tracker (PST) ===" -ForegroundColor Blue
Write-Host "Initializing project..." -ForegroundColor Green

# Backend setup
Set-Location backend

Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
.\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Copying .env file..." -ForegroundColor Yellow
Copy-Item .env.example .env

Write-Host "Running Django migrations..." -ForegroundColor Yellow
python manage.py migrate

Write-Host "Creating superuser..." -ForegroundColor Yellow
python manage.py createsuperuser

# Frontend setup
Set-Location ../frontend

Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:"
Write-Host "1. Backend: cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver"
Write-Host "2. Frontend: cd frontend && npm run dev"
Write-Host ""
Write-Host "Access the application at http://localhost:5173"
