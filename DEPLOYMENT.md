# Postgraduate Submissions Tracker (PST) — Production Deployment Guide

This guide covers preparing the frontend for **Vercel** and the backend (Django REST API) for a production host, plus the overall architecture and what runs where.

---

## 1. Code Changes Already Applied (Production Hardening)

| Area | Change | Why |
|------|--------|-----|
| `frontend/src/pages/LandingPage.jsx` | Removed the **"Test Accounts"** section that publicly displayed real emails + passwords (`student123`, `admin123`, …). Replaced with a clean **"How It Works"** section. | Publicly exposing credentials is a critical security flaw. |
| `backend/.env` | `EMAIL_BACKEND` set to `smtp.EmailBackend` (real email delivery), `JWT_SECRET_KEY` ≥ 32 chars. | OTPs must be emailed; JWT warning resolved. |
| `backend/pst_project/settings.py` | `SIMPLE_JWT['SIGNING_KEY']` now uses `JWT_SECRET_KEY`. | Fixes `InsecureKeyLengthWarning`. |
| `frontend/vercel.json` | Added Vite build config + SPA rewrites + asset caching headers. | Required for client-side routing & stable deploys on Vercel. |
| Reports API (`/reports/*`) | Standardized endpoints, removed duplicate aliases, cleaned test media/`__pycache__`. | Consistent, maintainable API surface. |

**What was verified:** `npm run build` succeeds (463 modules, dist/ generated). Backend `settings.py` contains no hardcoded secrets (only `config(...)` reads from `.env`).

---

## 2. Pre-Deployment Checklist

### Frontend (`frontend/`)
- [ ] `frontend/.env` (or Vercel env vars) has `VITE_API_URL = https://<your-backend-domain>/api`
- [ ] No real credentials anywhere in `src/` (only fixtures in `*.tests.py` and `create_test_users.py`)
- [ ] `npm run build` passes locally

### Backend (`backend/`)
- [ ] Deploy to a host that runs **ASGI/WSGI + Redis** (e.g. Render, Railway, Fly.io, Hetzner, AWS). **Vercel cannot run the Django backend** (no long-running server / Redis / DB writes reliably).
- [ ] `DEBUG=False`, strong `SECRET_KEY`, `ALLOWED_HOSTS` includes your backend domain + Vercel URL
- [ ] Use **PostgreSQL** (not SQLite) in production — set `DATABASE_URL=postgresql://...`
- [ ] `EMAIL_BACKEND=smtp.EmailBackend` with a real SMTP/transactional email provider
- [ ] Run `python manage.py migrate` and `collectstatic` on first deploy
- [ ] Serve `MEDIA_ROOT` via the host or object storage (S3/GCS), **not** local disk on ephemeral hosts

---

## 3. Deploy Frontend to Vercel

### Option A — Vercel Dashboard (easiest)
1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Vercel → **Add New Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Build settings are auto-detected from `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** Vite
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://<your-backend-domain>/api`
6. Click **Deploy**.

### Option B — Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel env add VITE_API_URL        # enter https://<backend>/api when prompted
vercel --prod
```

### `vercel.json` (already created)
- `rewrites`: all non-asset, non-`/api` routes fall back to `index.html` so React Router deep links (`/login`, `/dashboard`) work.
- `headers`: immutable 1-year caching for `/assets/*`.

> The Vite dev `proxy: { '/api': ... }` is **dev-only** and ignored in production. In prod, the frontend calls `VITE_API_URL` directly (configure CORS on the backend to allow your Vercel domain).

---

## 4. Deploy Backend (Django) — Recommended: Render.com

Vercel is for the SPA. The Django API + Celery + Redis + DB must live on a server/runtime host.

**render.yaml (example):**
```yaml
services:
  - type: web
    name: pst-api
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput
    startCommand: gunicorn pst_project.asgi:application -k uvicorn.workers.UvicornWorker
    envVars:
      - key: DEBUG
        value: false
      - key: DATABASE_URL
        fromDatabase:
          name: pst-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: EMAIL_BACKEND
        value: django.core.mail.backends.smtp.EmailBackend
      - key: EMAIL_HOST_USER
        sync: false          # set in dashboard
      - key: EMAIL_HOST_PASSWORD
        sync: false
      - key: CELERY_BROKER_URL
        fromService:
          type: redis
          name: pst-redis
          property: connectionString
  - type: redis
    name: pst-redis
  - type: web
    name: pst-worker
    runtime: python
    rootDir: backend
    startCommand: celery -A pst_project worker -l info
```

**Key production `settings.py` expectations already present:**
- `ALLOWED_HOSTS` read from env
- `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, HSTS enabled automatically when `DEBUG=False`
- `CORS_ALLOWED_ORIGINS` must include your Vercel URL (add it in env or settings)

---

## 5. Environment Variables — Who Sets What, Where

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | **Vercel** (frontend env) | Base URL the browser uses to call the API |
| `SECRET_KEY` | **Backend host** (secret) | Django signing |
| `JWT_SECRET_KEY` | **Backend host** (secret) | JWT token signing (≥32 chars) |
| `DEBUG` | Backend host | `false` in prod |
| `DATABASE_URL` | Backend host | PostgreSQL connection string |
| `EMAIL_BACKEND/HOST/PORT/USER/PASSWORD` | Backend host | Real SMTP for OTP emails |
| `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` | Backend host | Redis for async tasks |
| `CORS_ALLOWED_ORIGINS` | Backend host | Must include Vercel URL |
| `ALLOWED_HOSTS` | Backend host | Backend domain + Vercel URL |

> **Security rule:** Never commit `.env` (it is gitignored). `.env.example` is the committed template with placeholders only.

---

## 6. Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser / Mobile (PWA)                                       │
│  React SPA  ──built by Vite──▶  deployed on VERCEL (CDN)      │
│  Routes: / /login /register /verify-otp /dashboard /...       │
│  Talks to API via VITE_API_URL (CORS)                         │
└───────────────┬─────────────────────────────────────────────┘
                │  HTTPS  /api/*
                ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: Django + DRF  (deployed on Render/Railway/Fly)      │
│  - Auth: email/phone login, JWT (simplejwt), OTP verification │
│  - Apps: users, students, supervisors, stages, activities,    │
│    documents, complaints, consultations, notifications, audit │
│  - Reports API (/reports/*) for coordinators/dean/cod/director│
│  - Celery worker (async emails, reminders, 3-month unlocks)   │
└───────┬───────────────────┬───────────────────┬──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   PostgreSQL DB       Redis (Celery)      Object Storage
   (users, stages,     (broker +          (media: docs,
    documents…)         results)           minutes, avatars)
```

### Backend App Responsibilities
| App | Responsibility |
|-----|----------------|
| `users` | Custom user model, login/register/OTP/resend, JWT, RBAC roles |
| `students` | Student profile, supervisor assignment, stage progress |
| `stages` | Concept → Proposal → Thesis gating, approvals, locking |
| `activities` | Planned/completed research activities & calendar |
| `documents` | Upload/verify PDFs, required-doc checks per stage |
| `complaints` | Student complaints, coordinator response, SLA tracking |
| `consultations` | Supervisor consultation workflow + minutes |
| `notifications` | In-app + email notifications |
| `audit` | Audit log of privileged actions |
| `reports` | Aggregated read-only reports (CSV/PDF export) |

### Runtime Roles
| Component | Runs on | Notes |
|-----------|---------|-------|
| React SPA | Vercel | Static CDN, SPA rewrites, talks to API over HTTPS |
| Django API (web) | Render/Railway/Fly | Gunicorn/Uvicorn + Daphne for Channels WS |
| Celery worker | Same host / separate | Processes OTP emails, reminders, thesis unlocks |
| PostgreSQL | Managed DB | Persistent data |
| Redis | Managed | Celery broker + results |
| Email (SMTP) | Gmail SMTP / SendGrid / Mailgun | OTP + notifications |

### Data Flow (Registration → Verified)
1. User registers on Vercel SPA → `POST /api/users/register/`
2. Backend creates user (inactive) + generates OTP, queues `send_otp_email` (Celery → SMTP)
3. User receives OTP email, enters it on `/verify-otp` → `POST /api/auth/verify-otp/`
4. Backend activates user, returns JWT → stored in cookies → SPA routes to role home

---

## 7. Post-Deploy Verification
- [ ] `https://<vercel-url>/` loads landing page (no test-account credentials visible)
- [ ] Register a new student → OTP arrives by email (not console)
- [ ] Verify OTP → redirected to student dashboard
- [ ] Backend `/api/health/` returns `{"status":"ok"}`
- [ ] CORS allows Vercel → backend requests succeed in browser
- [ ] Reports export (CSV/PDF) works for coordinator role

## 8. Common Pitfalls
- **Vercel can't host Django** — keep the API on a server runtime.
- **CORS errors** → add Vercel domain to `CORS_ALLOWED_ORIGINS` on the backend.
- **Deep-link 404s** → `vercel.json` rewrites handle this (already added).
- **OTP in console only** → ensure `EMAIL_BACKEND=smtp.EmailBackend` + valid SMTP creds.
- **Media uploads lost** → use object storage, not ephemeral disk.
