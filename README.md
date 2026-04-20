# Postgraduate Submissions Tracker (PST)

**Full-stack web application for managing postgraduate student submissions and academic progress tracking.**

**Institution**: Jaramogi Oginga Odinga University of Science and Technology (JAOCST)  
**Status**: Active development | **Version**: 2.1.0 | **Updated**: April 20, 2026

---

## Table of Contents
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Quick Start

From the project root, use two terminals.

### 1. Start the backend
```bash
source .venv/bin/activate
DEBUG=true .venv/bin/python backend/manage.py runserver 0.0.0.0:8000
```

### 2. Start the frontend
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### 3. Open the app
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:8000/`
- Health check: `http://localhost:8000/api/health/`
- Django admin: `http://localhost:8000/admin/`

### 4. Switch between users
- Log out from the current session.
- Sign in again with one of the demo accounts below.
- The app currently supports student, supervisor, coordinator, and admin demo access.

---

## Demo Accounts

These accounts are available in the local development database:

- Student: `student@test.com` / `student123`
- Student 2: `student@example.com` / `password123`
- Supervisor: `supervisor@test.com` / `supervisor123`
- Coordinator: `coordinator@test.com` / `coordinator123`
- Admin: `admin@pst.com` / `admin123`

Notes:
- If you want to test another role, sign out first and then log in with that role's credentials.
- Supervisor tooling is present in the backend, but the dedicated supervisor dashboard UI is still a placeholder.

---

## Features

**User Management**
- Multi-role support (Student, Supervisor, Coordinator, Admin)
- JWT-based authentication with SimpleJWT
- Role-Based Access Control (RBAC)

**Stage Workflow**
- 3-stage progression: CONCEPT → PROPOSAL → THESIS
- Mandatory document requirements per stage
- Supervisor approval gating
- 3-month timer per stage (with 90-day lock for thesis)

**Document Management**
- Upload/verify documents (PDF, DOC, DOCX, PPTX)
- File size validation (<10MB)
- Document linking to stages
- Minutes of presentation tracking

**Activities**
- Activity planning and scheduling
- Planned → Completed state tracking
- Sequential completion enforcement

**Complaint System**
- Anonymous complaint submission
- Automatic routing to coordinators/admins
- 14-day escalation policy
- Response tracking

**Notifications**
- Dual-channel (Email + In-app)
- Activity reminders
- Document notifications
- Stage transition alerts

**Reporting & Analytics**
- Student progress by stage
- Supervisor activity metrics
- Complaint statistics
- Audit trail logging
- Login history tracking

**Audit & Compliance**
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

---

## Running the Application

### Option 1: Development Mode (Recommended for Testing)

#### Start Backend Server
```bash
source .venv/bin/activate
DEBUG=true .venv/bin/python backend/manage.py runserver 0.0.0.0:8000
```

#### Start Frontend Development Server
In another terminal:
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

#### Access Application
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:8000/admin
- **Health Check**: http://localhost:8000/api/health/

#### Monitor Live Logs
If you are running the app through detached `tmux` sessions:
```bash
tmux capture-pane -pt pst_backend
tmux capture-pane -pt pst_frontend
```

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

You are an expert Django/React code auditor and autonomous repair agent. Your task is to perform a full audit of the Postgraduate Submissions Tracker (PST) project codebase, verify every implementation requirement is met, test all API endpoints, and immediately fix any issue found. Do not ask for confirmation before fixing — fix and report.

Work through each category below in order. After each fix, re-verify that the fix resolved the issue. Output a final audit report at the end.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 1 — WORKSPACE HYGIENE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: Root contains backend/ and frontend/ directories. No loose source files at root.
FIX: Move any misplaced files into the correct directories.

CHECK: backend/apps/ contains all 10 Django apps: users, students, supervisors, stages, activities, documents, complaints, notifications, reports, audit.
FIX: Create any missing app directories with __init__.py, models.py, views.py, serializers.py, urls.py, admin.py, apps.py.

CHECK: frontend/src/ contains: components/, pages/, services/, hooks/, context/, utils/.
FIX: Create any missing directories.

CHECK: .env file is NOT committed to git. .gitignore covers: .env, __pycache__, *.pyc, db.sqlite3, node_modules/, media/, *.log.
FIX: Add missing entries to .gitignore. Remove any committed .env files from git tracking.

CHECK: .env.example files exist in backend/ and frontend/ with all required variable keys (no values).
FIX: Create .env.example with keys: SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL, EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME, FRONTEND_URL, CELERY_BROKER_URL.

CHECK: requirements.txt exists with all packages pinned to specific versions.
FIX: Generate requirements.txt from current environment if missing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 2 — DJANGO MODELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK AND FIX EACH MODEL:

User (apps/users/models.py):
- Extends AbstractBaseUser + PermissionsMixin
- Fields: id (UUID preferred), email, admission_number, phone, role (ENUM choices: student, supervisor, coordinator, dean, cod, director_bps), is_active, date_joined, last_login
- AUTH_USER_MODEL in settings points to this model

Student (apps/students/models.py):
- OneToOneField to User
- Fields: project_title, preferred_supervisor (FK to User, null=True, related_name), assigned_supervisor (FK to User, null=True, related_name), current_stage (ENUM: concept/proposal/thesis/completed), profile_complete (boolean, default False)

Supervisor (apps/supervisors/models.py):
- OneToOneField to User
- Fields: department, specialisation

Stage (apps/stages/models.py):
- Fields: student (FK), stage_type (ENUM), status (ENUM: active/completed/in_progress/locked), started_at, completed_at, approved_by (FK null), approval_date, thesis_submission_date (null), three_month_unlock_date (null)

Activity (apps/activities/models.py):
- Fields: stage (FK), created_by (FK to User), title, description, planned_date, completed_date (null), status (ENUM: planned/completed), marked_done_by (FK null)

Document (apps/documents/models.py):
- Fields: stage (FK), student (FK), doc_type (ENUM: minutes/transcript/fee_statement/proposal/thesis/intent_form), file (FileField), uploaded_at, file_size, is_verified (bool), verified_by (FK null), verified_at (null)

Minutes (apps/documents/models.py):
- Fields: stage (FK), student (FK), file (FileField), uploaded_at, is_approved (bool), approved_by (FK null), approved_at (null)

Meeting (apps/activities/models.py):
- Fields: student (FK), supervisor (FK), scheduled_date, status (ENUM: pending/confirmed/completed), notes, created_at

Complaint (apps/complaints/models.py):
- Fields: student (FK), content, submitted_at, status (ENUM: submitted/under_review/resolved), response_content (null), responded_at (null), responded_by (FK null), is_overdue (bool, default False)

Notification (apps/notifications/models.py):
- Fields: recipient (FK to User), message, notification_type, is_read (bool), created_at, link (null)

AuditLog (apps/audit/models.py):
- Fields: user (FK null, SET_NULL), action, description, ip_address, timestamp (auto_now_add), extra_data (JSONField, default dict)

VERIFY: Run `python manage.py makemigrations --check`. If it detects unapplied changes, run `python manage.py makemigrations` then report which models had missing migrations.
VERIFY: Run `python manage.py migrate` and confirm it completes with no errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 3 — API ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For each endpoint group below: confirm the URL is registered in urls.py, the view exists, the serializer exists, and the correct permission class is applied. Fix anything missing.

AUTH:
POST /api/auth/login/ — returns {access, refresh}. Fix: ensure SimpleJWT TokenObtainPairView is wired.
POST /api/auth/logout/ — blacklists refresh token. Fix: ensure TokenBlacklist app is installed and view implemented.
GET /api/auth/profile/ — returns full user + role-specific profile data.
PATCH /api/auth/profile/ — updates editable fields (project_title, phone, preferred_supervisor).

STUDENTS (coordinator/admin access):
GET /api/students/ — list all students with current stage.
GET /api/students/{id}/ — single student full profile.

STAGES:
GET /api/stages/ — student sees own stages; admin sees all.
GET /api/stages/{id}/ — detail with activities, documents, minutes status.
POST /api/stages/{id}/approve/ — ASSIGNED SUPERVISOR ONLY. Must check: all activities done + all mandatory docs present. Returns 403 if wrong role, 400 with error list if conditions unmet.

ACTIVITIES:
GET /api/activities/?stage={id}
POST /api/activities/ — student or supervisor can create.
PATCH /api/activities/{id}/ — creator or supervisor can edit.
POST /api/activities/{id}/complete/ — marks activity done. Sets completed_date and status=completed.

DOCUMENTS:
POST /api/documents/ — multipart upload. Validate: accepted MIME types (application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document). Max 10MB. Reject with 400 otherwise.
GET /api/documents/?stage={id}

MINUTES:
POST /api/minutes/ — upload minutes file.
POST /api/minutes/{id}/approve/ — SUPERVISOR ONLY. Sets is_approved=True, approved_by, approved_at.

MEETINGS:
GET /api/meetings/
POST /api/meetings/ — creates meeting request. Triggers notification to supervisor.

COMPLAINTS:
POST /api/complaints/ — STUDENT ROLE ONLY. Response must NOT include recipient list. Triggers notifications to coordinator, dean, cod, director_bps.
GET /api/complaints/ — returns complaints visible to requesting user's role.
POST /api/complaints/{id}/respond/ — coordinator/admin roles only. Sends response notification to student.

NOTIFICATIONS:
GET /api/notifications/ — current user's notifications only.
POST /api/notifications/{id}/read/ — marks as read.

SUPERVISOR:
GET /api/supervisor/students/ — only students where request.user is assigned_supervisor.
GET /api/supervisor/approvals/ — stages pending approval for request.user's assigned students.

REPORTS (coordinator + senior admins only):
GET /api/reports/students/?from={date}&to={date}
GET /api/reports/users/?from={date}&to={date}
GET /api/reports/supervisors/
GET /api/reports/complaints/
GET /api/reports/export/?type={report_type}&format={csv|pdf} — triggers file download response.

AUDIT (senior admins only: dean, cod, director_bps):
GET /api/logs/?user={id}&from={date}&to={date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 4 — RBAC & SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: Every DRF view has an explicit permission_classes list. No view uses IsAuthenticated alone when a role check is required.
FIX: Add custom permission classes (IsStudent, IsSupervisor, IsCoordinator, IsAdminRole, IsAssignedSupervisor) wherever missing.

CHECK: Password hasher is Argon2.
FIX: Add 'django.contrib.auth.hashers.Argon2PasswordHasher' as first entry in PASSWORD_HASHERS in settings. Install argon2-cffi.

CHECK: SECRET_KEY is loaded from os.environ — not hardcoded.
FIX: Replace any hardcoded key with os.environ.get('SECRET_KEY').

CHECK: Student queryset in all views is filtered to request.user — no student can see another student's data.
FIX: Add get_queryset() override in all student-scoped ViewSets.

CHECK: AuditLog middleware exists and is in MIDDLEWARE list. It must capture: user, action, ip_address, timestamp on every authenticated request.
FIX: Create middleware class and add to MIDDLEWARE.

CHECK: JWT token rotation and blacklisting is configured in SIMPLE_JWT settings.
FIX: Add ROTATE_REFRESH_TOKENS = True, BLACKLIST_AFTER_ROTATION = True to SIMPLE_JWT config.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 5 — BUSINESS LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: Stage approval endpoint validates all mandatory documents are present before approving.
FIX: In the approve view, query Document.objects.filter(stage=stage, doc_type__in=REQUIRED_DOCS[stage.stage_type]) and return a 400 error listing missing types if any are absent.

CHECK: Stage approval endpoint validates all activities in the stage are status=completed.
FIX: Add check Activity.objects.filter(stage=stage).exclude(status='completed').exists() — return 400 if True.

CHECK: Thesis submission triggers a Celery task that sets three_month_unlock_date = now + 90 days and stage.status = IN_PROGRESS.
FIX: Create Celery task `set_thesis_in_progress` called on thesis doc upload.

CHECK: Celery beat task `flag_overdue_complaints` exists and runs daily — sets is_overdue=True on Complaint.objects.filter(status__in=['submitted','under_review'], submitted_at__lt=now-14days, response_content__isnull=True).
FIX: Create task and register in CELERY_BEAT_SCHEDULE.

CHECK: Celery beat task `check_thesis_unlock` exists — changes stage status from IN_PROGRESS to ACTIVE (allowing supervisor final approval) when three_month_unlock_date <= now.
FIX: Create task and register in CELERY_BEAT_SCHEDULE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 6 — NOTIFICATIONS & EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: A notify() helper function or service exists that: creates a Notification record AND dispatches an async Celery email task.
FIX: Create apps/notifications/services.py with notify(recipient, message, notification_type, link=None) function.

CHECK: notify() is called in all required trigger points:
- Activity created (to relevant supervisor)
- Document uploaded (to assigned supervisor)
- Minutes uploaded (to assigned supervisor)
- Minutes approved (to student)
- Stage approved (to student)
- Complaint submitted (to coordinator, dean, cod, director_bps)
- Complaint response sent (to student)
- Complaint overdue flag set (to coordinator, dean, cod, director_bps)
- Meeting request created (to supervisor)
FIX: Add missing notify() calls to the relevant views or model signal handlers.

CHECK: Email backend in development is django.core.mail.backends.console.EmailBackend.
FIX: Set EMAIL_BACKEND in development settings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 7 — FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: ProtectedRoute component exists and wraps all non-auth routes.
FIX: Create ProtectedRoute that checks auth context and redirects to /login if unauthenticated.

CHECK: Role-based routing — each role has its own page directory (pages/student/, pages/supervisor/, pages/coordinator/, pages/admin/) and cannot access other role routes.
FIX: Add role check in ProtectedRoute that also validates the user's role against the route's required role.

CHECK: JWT tokens are NOT stored in localStorage.
FIX: Store access token in memory (React context/state) and refresh token in httpOnly cookie.

CHECK: Student dashboard renders project_title from the profile API as the main header.
FIX: Fetch /api/auth/profile/ on mount and set project_title in page header.

CHECK: Stage indicator component is present in the student dashboard layout — shows current stage name.
FIX: Create StageIndicator component that reads current_stage from student profile.

CHECK: Activity calendar component exists using FullCalendar or equivalent — maps Activity records to calendar events with planned_date as event date.
FIX: Install FullCalendar, create ActivityCalendar component, fetch /api/activities/?stage={id} and map to events.

CHECK: Document upload component validates file type (PDF/DOC/DOCX) and size (max 10MB) client-side before submitting.
FIX: Add validation logic in the onChange handler before calling the upload API.

CHECK: Complaint form modal does NOT display any recipient names.
FIX: Remove any recipient display from the form component.

CHECK: Reports page has a date range picker and triggers API calls with ?from= and ?to= query params.
FIX: Add date range picker (react-datepicker or similar) and append params to report API calls.

CHECK: Export buttons (CSV/PDF) trigger a file download using a Blob response — not opening a new tab.
FIX: Use axios with responseType: 'blob' and create an object URL to trigger download.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 8 — DEPLOYMENT CONFIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK: docker-compose.yml defines all 6 services: web (Django/Gunicorn), db (PostgreSQL), redis, celery, celery-beat, nginx.
FIX: Add any missing services with correct image, environment, depends_on, and volume configurations.

CHECK: Nginx config serves /static/ and /media/ as static directories — does not proxy these to Django.
FIX: Add location /static/ and location /media/ blocks to nginx.conf pointing to the correct filesystem paths.

CHECK: collectstatic is run in the Docker entrypoint or build step.
FIX: Add `python manage.py collectstatic --noinput` to the Docker CMD or entrypoint script.

CHECK: Production settings file (settings/production.py or pst_project/settings_prod.py) has SECURE_SSL_REDIRECT = True, SECURE_HSTS_SECONDS >= 31536000, DEBUG = False, ALLOWED_HOSTS set explicitly.
FIX: Create or update production settings with all required security settings.

CHECK: Health check view exists at /api/health/ returning HTTP 200.
FIX: Add a simple view that returns Response({'status': 'ok'}) and wire it to /api/health/.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL OUTPUT REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After completing all checks and fixes, produce a structured audit report with:

1. PASSED — list of all checks that were already correct
2. FIXED — list of every issue found and exactly what was changed to fix it
3. WARNINGS — items flagged as best-practice gaps but not blocking
4. FAILED — any check that could not be auto-fixed (explain why and what manual action is needed)
5. SUMMARY — total counts: passed / fixed / warnings / failed

Format the report as a clean structured table per category.
    
