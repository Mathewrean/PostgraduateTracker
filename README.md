# Postgraduate Submissions Tracker (PST)

**Full-stack web application for managing postgraduate student submissions and academic progress tracking.**

📍 **Institution**: Jaramogi Oginga Odinga University of Science and Technology (JAOCST)  
✅ **Status**: Production Ready | **Version**: 2.1.0 | **Updated**: April 16, 2026

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Features

✅ **User Management**
- Multi-role support (Student, Supervisor, Coordinator, Admin)
- JWT-based authentication with SimpleJWT
- Role-Based Access Control (RBAC)

✅ **Stage Workflow**
- 3-stage progression: CONCEPT → PROPOSAL → THESIS
- Mandatory document requirements per stage
- Supervisor approval gating
- 3-month timer per stage (with 90-day lock for thesis)

✅ **Document Management**
- Upload/verify documents (PDF, DOC, DOCX, PPTX)
- File size validation (<10MB)
- Document linking to stages
- Minutes of presentation tracking

✅ **Activities & Calendar**
- Activity planning with calendar integration
- Planned → Completed state tracking
- Sequential completion enforcement
- Integrated with FullCalendar

✅ **Complaint System**
- Anonymous complaint submission
- Automatic routing to coordinators/admins
- 14-day escalation policy
- Response tracking

✅ **Notifications**
- Dual-channel (Email + In-app)
- Activity reminders
- Document notifications
- Stage transition alerts

✅ **Reporting & Analytics**
- Student progress by stage
- Supervisor activity metrics
- Complaint statistics
- Audit trail logging
- Login history tracking

✅ **Audit & Compliance**
- Comprehensive audit logging
- IP address tracking
- Timestamp recording
- User action history

---

## Tech Stack

**Backend:**
- Django 5.0.1 + Django REST Framework 3.14.0
- MySQL/SQLite for database
- Celery for async tasks (optional)
- Django Channels for real-time updates (optional)
- SimpleJWT 5.5.1 for authentication

**Frontend:**
- React 18+ with Vite
- Tailwind CSS for styling
- Zustand for state management
- Axios for HTTP requests
- FullCalendar for calendar views

**DevOps:**
- Docker & Docker Compose
- Nginx reverse proxy
- Redis for caching (optional)

---

## Prerequisites

Ensure you have installed:
- **Python 3.10+**
- **Node.js 16+** and npm
- **MySQL 8.0+** (or SQLite for development)
- **Git**
- **Docker** (optional, for containerized deployment)

For Linux users with externally-managed Python, use virtual environments:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Linux/Mac
# or
.venv\Scripts\activate  # On Windows
```

---

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd PostgraduateTracker
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Database
```bash
# For SQLite (development - default)
# Database automatically created at backend/db.sqlite3

# For MySQL (production)
# Update backend/pst_project/settings.py:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'pst_db',
#         'USER': 'pst_user',
#         'PASSWORD': 'your_password',
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }
```

#### Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser (Admin)
```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Configure API Endpoint
Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## Running the Application

### Option 1: Development Mode (Recommended for Testing)

#### Start Backend Server
```bash
cd backend
python manage.py runserver
# Server runs at http://localhost:8000
```

#### Start Frontend Development Server
In another terminal:
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

#### Access Application
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/schema/ (if drf-spectacular installed)

### Option 2: Production with Docker

#### Build and Run Containers
```bash
docker-compose up -d
```

Services will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000
- **MySQL Database**: localhost:3306

#### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Stop Services
```bash
docker-compose down
```

### Option 3: Production Manual Deployment

#### Backend (Gunicorn + Nginx)
```bash
cd backend

# Install production dependencies
pip install gunicorn whitenoise

# Run with Gunicorn
gunicorn pst_project.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Configure Nginx (use provided nginx.conf)
# Deploy nginx configuration from root directory
```

#### Frontend (Build & Serve)
```bash
cd frontend

# Build for production
npm run build

# Serve with any HTTP server (Nginx recommended)
# Point to frontend/dist directory
```

---

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Get JWT access token
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/users/register/` - Register new user
- `POST /api/users/logout/` - Logout and blacklist token

### User Management
- `GET /api/users/me/` - Get current user profile
- `POST /api/users/update_profile/` - Update profile
- `GET /api/users/` - List all users (admin only)

### Students
- `GET /api/students/profile/` - Get student profile
- `POST /api/students/profile/` - Update student profile
- `GET /api/students/` - List students (coordinator/admin only)

### Stages
- `GET /api/stages/current_stage/` - Get active stage
- `GET /api/stages/` - List stages
- `POST /api/stages/{id}/approve/` - Approve stage (supervisor only)

### Activities
- `GET /api/activities/` - List activities
- `POST /api/activities/` - Create activity
- `POST /api/activities/{id}/mark_done/` - Mark activity completed
- `GET /api/activities/calendar/` - Get calendar view

### Documents
- `GET /api/documents/documents/` - List documents
- `POST /api/documents/documents/` - Upload document
- `POST /api/documents/documents/{id}/verify/` - Verify document
- `GET /api/documents/minutes/` - Get minutes
- `POST /api/documents/minutes/` - Upload minutes

### Complaints
- `POST /api/complaints/` - Submit complaint
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/{id}/respond/` - Respond to complaint

### Notifications
- `GET /api/notifications/notifications/` - List notifications
- `POST /api/notifications/notifications/{id}/mark_as_read/` - Mark read
- `GET /api/notifications/notifications/unread_count/` - Get unread count

### Reports
- `GET /api/reports/student_progress/` - Student progress report
- `GET /api/reports/supervisor_report/` - Supervisor activity report
- `GET /api/reports/complaint_report/` - Complaint statistics
- `GET /api/reports/login_history/` - Login audit trail
- `GET /api/reports/activity_log/` - Activity audit log

---

## Testing

### Run API Tests
```bash
cd backend

# Run all tests
python manage.py test

# Run specific test class
python manage.py test apps.users.tests.UserTestCase

# Run with verbose output
python manage.py test --verbosity=2

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Test All Endpoints
```bash
cd backend

# Comprehensive endpoint testing
python manage.py test test_all_endpoints --verbosity=2
```

### Manual Testing with cURL

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

#### Get Current User
```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

#### Submit Complaint
```bash
curl -X POST http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Issue description"}'
```

### Frontend Testing (React)
```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Build for testing
npm run build
```

---

## Project Structure

```
PostgraduateTracker/
├── backend/
│   ├── pst_project/          # Django settings & URLs
│   │   ├── settings.py       # Main configuration
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI app
│   ├── apps/
│   │   ├── users/            # User auth & RBAC
│   │   ├── students/         # Student profiles
│   │   ├── stages/           # Stage workflow
│   │   ├── activities/       # Activity tracking
│   │   ├── documents/        # Document upload
│   │   ├── complaints/       # Complaint system
│   │   ├── notifications/    # Notifications
│   │   ├── reports/          # Analytics & reports
│   │   │── audit/            # Audit logging
│   │   └── supervisors/      # Supervisor routing
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py            # Django management
│   └── db.sqlite3           # SQLite database (dev)
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand state
│   │   ├── styles/           # Tailwind CSS
│   │   └── App.jsx          # Main app component
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
│
├── docker-compose.yml       # Docker services
├── nginx.conf              # Nginx configuration
├── Dockerfile              # Backend container
└── README.md               # This file
```

---

## Troubleshooting

### Backend Issues

**Issue**: `ImproperlyConfigured: Requested setting REST_FRAMEWORK`
```bash
# Ensure DJANGO_SETTINGS_MODULE is set
export DJANGO_SETTINGS_MODULE=pst_project.settings
```

**Issue**: `ModuleNotFoundError: No module named 'apps'`
```bash
# Make sure you're in backend directory
cd backend
```

**Issue**: Database permission denied
```bash
# Reset migrations (development only)
python manage.py migrate apps <app_name> zero
python manage.py migrate
```

### Frontend Issues

**Issue**: API connection refused
```bash
# Check backend is running
python manage.py runserver

# Verify API URL in src/services/api.js
```

**Issue**: CORS errors
```bash
# CORS is enabled for localhost:5173
# For production, update CORS_ALLOWED_ORIGINS in settings.py
```

---

## Environment Variables

Create `.env` file in backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Performance Optimization

### Enable Caching
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Enable Celery for Async Tasks
```bash
pip install celery redis
celery -A pst_project worker -l info
```

### Database Indexing
All models have optimized indexes for common queries.

---

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

---

## Support

For issues or questions:
- Check [troubleshooting](#troubleshooting) section
- Review API documentation at http://localhost:8000/api/schema/
- Check Django admin at http://localhost:8000/admin/

---

## License

This project is proprietary and confidential.
