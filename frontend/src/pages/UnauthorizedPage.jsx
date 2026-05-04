import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
         style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="panel max-w-md w-full text-center">
        <div className="text-5xl font-bold mb-4" style={{ color: 'var(--color-danger)' }}>403</div>
        <h2 className="text-2xl font-semibold mb-3">Access Denied</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>You do not have permission to access this resource.</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full btn-primary font-semibold"
          >
            Go Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
