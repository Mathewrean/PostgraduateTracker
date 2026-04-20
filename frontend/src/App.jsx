import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard'
import { LandingPage } from './pages/LandingPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { Toaster } from 'react-hot-toast'
import { authService } from './services'
import { ErrorBoundary } from './components/ErrorBoundary'

function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)

  if (!initialized && token) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export const App = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const initialized = useAuthStore((state) => state.initialized)
  const setInitialized = useAuthStore((state) => state.setInitialized)

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

    return () => {
      ignore = true
    }
  }, [setInitialized, setToken, setUser, token])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token && initialized ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={token && initialized ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={token && initialized ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === 'STUDENT' ? (
                  <StudentDashboard />
                ) : user?.role === 'SUPERVISOR' ? (
                  <div className="p-10 bg-gradient-to-br from-slate-50 to-blue-100 min-h-screen flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-bold text-gray-800">Supervisor Dashboard</h1>
                    <p className="mt-4 text-gray-600 text-lg">Supervisor tools are being finalized.</p>
                  </div>
                ) : ['COORDINATOR', 'ADMIN'].includes(user?.role) ? (
                  <CoordinatorDashboard />
                ) : (
                  <Navigate to="/unauthorized" replace />
                )}
              </PrivateRoute>
            }
          />

          <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/coordinator/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to={token && initialized ? "/dashboard" : "/"} replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
