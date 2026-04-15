import React from 'react'
import { useNavigate } from 'react-router-dom'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-pink-700 flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h1 className="text-6xl font-bold mb-4">🚫 Access Denied</h1>
        <p className="text-2xl mb-6">You don't have permission to access this resource</p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <p className="text-base opacity-90 mb-4">
            You are logged in, but your user role doesn't have access to this page.
          </p>
          <p className="text-sm opacity-75">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              navigate('/login')
            }}
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
