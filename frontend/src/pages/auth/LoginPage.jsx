import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useAuthStore, useUIStore } from '../../context/store'
import toast from 'react-hot-toast'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await authService.login(email, password)
      setToken(response.data.access)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center p-4 transition-colors duration-200`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">PST</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Postgraduate Submissions Tracker</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
          <div className="space-y-5">
            <div>
              <label className={`block ${labelColor} font-medium mb-2`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors`}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className={`block ${labelColor} font-medium mb-2`}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors`}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Registration Link */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border text-center`}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create one here
            </Link>
          </p>
        </div>

        {/* Test Credentials */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
          <p className="font-semibold mb-3 text-sm">Demo Credentials:</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Student</p>
              <p className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>student@test.com / student123</p>
            </div>
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Supervisor</p>
              <p className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>supervisor@test.com / supervisor123</p>
            </div>
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Coordinator</p>
              <p className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>coordinator@test.com / coordinator123</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-yellow-400 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200'} border transition-colors duration-200 text-sm`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}
