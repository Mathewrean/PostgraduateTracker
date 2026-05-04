import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useAuthStore, useUIStore } from '../../context/store'
import { setCookie } from '../../services/api'
import toast from 'react-hot-toast'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      setCookie('pst_access_token', response.data.access)
      setCookie('pst_refresh_token', response.data.refresh)
      setToken(response.data.access)
      setUser(response.data.user)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
         className="flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: 'var(--color-brand)' }}>
            <span className="font-bold text-2xl" style={{ color: '#fff' }}>PST</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Postgraduate Submissions Tracker</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="panel space-y-5">
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-semibold"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-6 panel text-center">
          <p style={{ color: 'var(--text-primary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              Create one here
            </Link>
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-6 panel">
          <p className="font-semibold mb-3 text-sm">Demo Credentials:</p>
          <div className="space-y-2 text-sm">
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Student</p>
              <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>student@test.com / student123</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Supervisor</p>
              <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>supervisor@test.com / supervisor123</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Coordinator</p>
              <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>coordinator@test.com / coordinator123</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleTheme}
            className="btn-secondary text-sm"
          >
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}
