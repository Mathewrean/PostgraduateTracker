import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { useUIStore } from './context/store'
import { authService } from './services'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
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

function getHomePath(role) {
  if (role === 'student') return '/dashboard'
  if (role === 'supervisor') return '/dashboard'
  if (['coordinator', 'dean', 'cod', 'director_bps'].includes(role)) return '/dashboard'
  return '/dashboard'
}

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

export const App = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const initializeTheme = useUIStore((state) => state.initializeTheme)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

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

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
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

          <Route path="/activities" element={<PrivateRoute allowedRoles={['student']}><ActivitiesPage /></PrivateRoute>} />
          <Route path="/student/activities" element={<PrivateRoute allowedRoles={['student']}><ActivitiesPage /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute allowedRoles={['student']}><DocumentsPage /></PrivateRoute>} />
          <Route path="/student/documents" element={<PrivateRoute allowedRoles={['student']}><DocumentsPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute allowedRoles={['student', 'supervisor', 'coordinator', 'dean', 'cod', 'director_bps']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/student/notifications" element={<PrivateRoute allowedRoles={['student']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute allowedRoles={['student']}><MessagesPage /></PrivateRoute>} />
          <Route path="/student/messages" element={<PrivateRoute allowedRoles={['student']}><MessagesPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute allowedRoles={['student']}><ProfilePage /></PrivateRoute>} />
          <Route path="/student/profile" element={<PrivateRoute allowedRoles={['student']}><ProfilePage /></PrivateRoute>} />
          <Route path="/meetings" element={<PrivateRoute allowedRoles={['student']}><MeetingsPage /></PrivateRoute>} />
          <Route path="/student/meetings" element={<PrivateRoute allowedRoles={['student']}><MeetingsPage /></PrivateRoute>} />

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
