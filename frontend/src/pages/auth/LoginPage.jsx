import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useAuthStore, useUIStore } from '../../context/store'
import { setCookie } from '../../services/api'
import { getHomePath } from '../../utils/navigation'
import { TopbarBrand } from '../../components/TopbarBrand'
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
      const destination = getHomePath(response.data.user?.role)
      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
         className="relative flex items-center justify-center p-4 pt-20 transition-colors duration-200">
      <header className="auth-topbar">
        <TopbarBrand />
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
          )}
        </button>
      </header>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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

      </div>
    </div>
  )
}
