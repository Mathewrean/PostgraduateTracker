import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { LoginPage } from './pages/auth/LoginPage'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard'
import './index.css'
import { Toaster } from 'react-hot-toast'

function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/dashboard"
          element={
            <PrivateRoute allowedRoles={['COORDINATOR', 'ADMIN']}>
              <CoordinatorDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/student/dashboard" />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
