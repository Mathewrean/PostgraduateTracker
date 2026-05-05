# Postgraduate Submissions Tracker (PST)

## Overview
Postgraduate Tracker is a full-stack application for managing postgraduate student progress, supervisor approvals, coordinator oversight, and audit workflows.

## Production Readiness
This repository is configured for local development and can be production-ready with the following improvements:
- Use a production-grade database such as PostgreSQL instead of SQLite
- Configure secure `SECRET_KEY` and environment variables in `.env`
- Use a proper web server or container orchestration for deployment
- Enable HTTPS for frontend/backend communication

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### Backend
1. Navigate to the project root and activate the virtual environment:
   ```bash
   cd backend
   source .venv/bin/activate  # or create one: python -m venv .venv
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations:
   ```bash
   python manage.py migrate
   ```
4. Create demo users (optional):
   ```bash
   python create_test_users.py
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```
   The API will be available at http://localhost:8000

### Frontend
1. In a new terminal, navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev -- --host
   ```
   The app will be available at http://localhost:5173

### Running Both Servers
For development, you need both servers running:
```bash
# Terminal 1 - Backend
cd backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 - Frontend
cd frontend && npm run dev -- --host
```

### Environment configuration
- Copy `.env.example` to `.env` in both the `backend/` and `frontend/` directories.
- Update API URLs, secret keys, and other settings as needed.

## Authentication & Role-Based Dashboard Flow
The application supports user registration and role-based login. After login, users are routed to the correct dashboard based on the selected role.

### Registration Flow
1. Users register at `/register` selecting their role (student, supervisor, coordinator, dean, cod, director_bps)
2. Upon successful registration, users are automatically logged in and redirected to their role-based dashboard
3. Role-specific profiles are automatically created (Student profile or Supervisor profile)

### Supported roles
- `student` - Can view/upload documents, track stages, submit complaints
- `supervisor` - Can view assigned students, approve stages and documents
- `coordinator` - Can view all students, assign supervisors, generate reports
- `dean` - Full administrative access
- `cod` - Administrative access
- `director_bps` - Administrative access

### Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | student123 |
| Supervisor | supervisor@test.com | supervisor123 |
| Coordinator | coordinator@test.com | coordinator123 |

## API Endpoints
- `POST /api/users/register/` — user registration
- `POST /api/auth/login/` — login with email/password
- `GET /api/auth/profile/` — fetch current authenticated user
- `POST /api/auth/logout/` — logout
- `GET /api/health/` — health check

## Key Features
- **Role-based access control** - Each role has specific permissions and dashboard views
- **Document management** - Students can upload documents, supervisors can verify
- **Stage workflow** - Students progress through CONCEPT → PROPOSAL → THESIS stages
- **Activity tracking** - Track research activities and milestones
- **Complaint system** - Students can submit complaints, coordinators can respond
- **Audit logging** - All actions are logged for accountability

## Notes
- Ensure both backend (port 8000) and frontend (port 5173) servers are running
- The frontend proxy automatically forwards `/api/` requests to the backend
- After registering, users are automatically logged in and redirected to their dashboard
*Last updated: May 2026*
