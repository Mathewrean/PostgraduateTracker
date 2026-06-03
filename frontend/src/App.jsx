import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { useUIStore } from './context/store'
import { authService } from './services'
import { ErrorBoundary } from './components/ErrorBoundary'
import { toast, Toaster } from 'react-hot-toast'
import { getHomePath, getNotificationAppPath } from './utils/navigation'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage'
import { LandingPage } from './pages/LandingPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard'
import { ActivitiesPage } from './pages/student/ActivitiesPage'
import { DocumentsPage } from './pages/student/DocumentsPage'
import { NotificationsPage } from './pages/student/NotificationsPage'
import { MessagesPage } from './pages/student/MessagesPage'
import { ProfilePage } from './pages/student/ProfilePage'
import { MeetingsPage } from './pages/student/MeetingsPage'

// Supervisor Pages
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard'
import { MyStudentsPage } from './pages/supervisor/MyStudentsPage'
import { PendingApprovalsPage } from './pages/supervisor/PendingApprovalsPage'
import { SupervisorStudentDetailPage } from './pages/supervisor/SupervisorStudentDetailPage'

// Coordinator Pages
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard'
import { AllStudentsPage } from './pages/coordinator/AllStudentsPage'
import { AssignSupervisorsPage } from './pages/coordinator/AssignSupervisorsPage'
import { ComplaintsPage as CoordinatorComplaintsPage } from './pages/coordinator/ComplaintsPage'
import { ReportsPage } from './pages/coordinator/ReportsPage'

// Admin Pages
import { AuditLogPage } from './pages/admin/AuditLogPage'
import { UserActivityPage } from './pages/admin/UserActivityPage'

function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)

  if (!initialized && token) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.125rem' }}>Loading dashboard...</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomePath(user?.role)} replace />
  }

  return children
}

function StudentHomeRoute({ user }) {
  if (user?.profile_complete === false) {
    return <Navigate to="/profile" replace />
  }
  return <StudentDashboard />
}

function LegacyApiRedirect() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  return <Navigate to={getNotificationAppPath(location.pathname, user?.role)} replace />
}

export const App = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const initializeTheme = useUIStore((state) => state.initializeTheme)

  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    const inStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
    setIsIos(iosDevice && !inStandalone)
  }, [])

  useEffect(() => {
    let ignore = false
    const hydrateSession = async () => {
      if (!token) {
        setInitialized(true)
        return
      }
      try {
        const response = await authService.getCurrentUser()
        if (!ignore) {
          setUser(response.data)
          setInitialized(true)
        }
      } catch (error) {
        if (!ignore) {
          setToken(null)
          setUser(null)
          setInitialized(true)
        }
      }
    }
    hydrateSession()
    return () => { ignore = true }
  }, [setUser, setToken, setInitialized, token])

  useEffect(() => {
    const beforeInstallHandler = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setShowInstallBanner(true)
    }

    const appInstalledHandler = () => {
      setInstallPrompt(null)
      setShowInstallBanner(false)
    }

    window.addEventListener('beforeinstallprompt', beforeInstallHandler)
    window.addEventListener('appinstalled', appInstalledHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (isIos) {
      toast('Open Safari, tap Share, then Add to Home Screen to install PST.')
      return
    }

    if (!installPrompt) {
      toast('Install option is not available right now.')
      return
    }

    installPrompt.prompt()
    const choiceResult = await installPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      toast.success('PST is ready to install. Add it to your home screen!')
    } else {
      toast('Install dismissed. You can still add PST later from browser options.')
    }

    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {(showInstallBanner || isIos) && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: 'min(95%, 420px)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem' }}>Install PST</strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {isIos
                  ? 'Open Safari, tap Share, then Add to Home Screen to install PST.'
                  : 'Add the app to your home screen for a native experience.'}
              </span>
            </div>
            <button
              onClick={handleInstall}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isIos ? 'How to install' : 'Install'}
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/verify-otp" element={token ? <Navigate to="/dashboard" replace /> : <VerifyOtpPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['student', 'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']}>
                {user?.role === 'student' ? <StudentHomeRoute user={user} /> : 
                 user?.role === 'supervisor' ? <SupervisorDashboard /> :
                 ['coordinator', 'dean', 'cod', 'director_bps'].includes(user?.role) ? <CoordinatorDashboard /> :
                 <Navigate to="/unauthorized" replace />}
              </PrivateRoute>
            }
          />
          <Route
            path="/supervisor/dashboard"
            element={
              <PrivateRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/activities" element={<PrivateRoute allowedRoles={['student']}><ActivitiesPage /></PrivateRoute>} />
          <Route path="/student/activities" element={<PrivateRoute allowedRoles={['student']}><ActivitiesPage /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute allowedRoles={['student']}><DocumentsPage /></PrivateRoute>} />
          <Route path="/student/documents" element={<PrivateRoute allowedRoles={['student']}><DocumentsPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute allowedRoles={['student', 'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/notifications/:notificationId" element={<PrivateRoute allowedRoles={['student', 'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/student/notifications" element={<PrivateRoute allowedRoles={['student']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/student/notifications/:notificationId" element={<PrivateRoute allowedRoles={['student']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute allowedRoles={['student']}><MessagesPage /></PrivateRoute>} />
          <Route path="/student/messages" element={<PrivateRoute allowedRoles={['student']}><MessagesPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute allowedRoles={['student']}><ProfilePage /></PrivateRoute>} />
          <Route path="/student/profile" element={<PrivateRoute allowedRoles={['student']}><ProfilePage /></PrivateRoute>} />
          <Route path="/meetings" element={<PrivateRoute allowedRoles={['student']}><MeetingsPage /></PrivateRoute>} />
          <Route path="/student/meetings" element={<PrivateRoute allowedRoles={['student']}><MeetingsPage /></PrivateRoute>} />

          {/* Legacy API notification links opened in the browser should stay in the app. */}
          <Route path="/api/documents/:id/*" element={<PrivateRoute><LegacyApiRedirect /></PrivateRoute>} />
          <Route path="/api/minutes/:id/*" element={<PrivateRoute><LegacyApiRedirect /></PrivateRoute>} />
          <Route path="/api/activities/:id/*" element={<PrivateRoute><LegacyApiRedirect /></PrivateRoute>} />
          <Route path="/api/stages/:id/*" element={<PrivateRoute><LegacyApiRedirect /></PrivateRoute>} />
          <Route path="/api/notifications/meetings/:id/*" element={<PrivateRoute><LegacyApiRedirect /></PrivateRoute>} />

          {/* Supervisor Routes */}
          <Route path="/supervisor/students" element={<PrivateRoute allowedRoles={['supervisor']}><MyStudentsPage /></PrivateRoute>} />
          <Route path="/supervisor/students/:studentId" element={<PrivateRoute allowedRoles={['supervisor']}><SupervisorStudentDetailPage /></PrivateRoute>} />
          <Route path="/supervisor/approvals" element={<PrivateRoute allowedRoles={['supervisor']}><PendingApprovalsPage /></PrivateRoute>} />

          {/* Coordinator Routes */}
          <Route path="/coordinator/students" element={<PrivateRoute allowedRoles={['coordinator', 'dean', 'cod', 'director_bps']}><AllStudentsPage /></PrivateRoute>} />
          <Route path="/coordinator/assign" element={<PrivateRoute allowedRoles={['coordinator', 'dean', 'cod', 'director_bps']}><AssignSupervisorsPage /></PrivateRoute>} />
          <Route path="/coordinator/complaints" element={<PrivateRoute allowedRoles={['coordinator', 'dean', 'cod', 'director_bps']}><CoordinatorComplaintsPage /></PrivateRoute>} />
          <Route path="/coordinator/reports" element={<PrivateRoute allowedRoles={['coordinator', 'dean', 'cod', 'director_bps']}><ReportsPage /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/audit" element={<PrivateRoute allowedRoles={['dean', 'cod', 'director_bps']}><AuditLogPage /></PrivateRoute>} />
          <Route path="/admin/activity" element={<PrivateRoute allowedRoles={['dean', 'cod', 'director_bps']}><UserActivityPage /></PrivateRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
