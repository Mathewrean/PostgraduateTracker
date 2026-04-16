import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { StudentDashboard } from './pages/student/StudentDashboardNew'
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard'
import { LandingPage } from './pages/LandingPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { Toaster } from 'react-hot-toast'

function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

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

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user?.role === 'STUDENT' ? (
                <StudentDashboard />
              ) : user?.role === 'SUPERVISOR' ? (
                <div className="p-10 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col justify-center items-center">
                  <h1 className="text-4xl font-bold text-gray-800">👨‍🏫 Supervisor Dashboard</h1>
                  <p className="mt-4 text-gray-600 text-lg">Coming soon...</p>
                </div>
              ) : ['COORDINATOR', 'ADMIN'].includes(user?.role) ? (
                <CoordinatorDashboard />
              ) : (
                <Navigate to="/unauthorized" replace />
              )}
            </PrivateRoute>
          }
        />
        
        {/* Backward compatibility routes */}
        <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/coordinator/dashboard" element={<Navigate to="/dashboard" replace />} />
        
        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}
