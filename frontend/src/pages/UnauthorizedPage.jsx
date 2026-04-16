import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from '../context/store'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const isDark = useUIStore((state) => state.isDark)

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center p-4 transition-colors duration-200`}>
      <div className={`${cardBg} p-8 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-md text-center`}>
        <div className="text-5xl font-bold text-red-600 mb-4">403</div>
        <h2 className="text-2xl font-semibold mb-3">Access Denied</h2>
        <p className={`${secondaryText} mb-8`}>You do not have permission to access this resource.</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Go Home
          </button>
          <button
            onClick={handleLogout}
            className={`w-full py-2 rounded-lg font-semibold transition-colors duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
