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

### Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

### Environment configuration
- Copy `.env.example` to `.env` in both the `backend/` and `frontend/` directories.
- Update API URLs, secret keys, and other settings as needed.

## Authentication & Role-Based Dashboard Flow
The application supports user registration and role-based login. After login, users are routed to the correct dashboard based on the selected role.

### Supported roles
- `student`
- `supervisor`
- `coordinator`
- `dean`
- `cod`
- `director_bps`

### Example demo accounts
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

## Cleanup and Local Artifacts
Local development artifacts such as `db.sqlite3`, `venv/`, and `backend/venv/` are not required for production and should be removed before packaging the project.

## Notes
- After registering, users should login and be redirected to the correct dashboard based on their selected role.
- Supervisor users should be able to access supervisor-specific pages such as `My Students` and `Pending Approvals` without full page reloads.

---
*Last updated: May 2026*
