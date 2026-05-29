import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useAuthStore, useUIStore } from '../../context/store'
import { setCookie } from '../../services/api'
import { getHomePath } from '../../utils/navigation'
import toast from 'react-hot-toast'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    admission_number: '',
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.admission_number || !formData.phone) {
      toast.error('Email, admission number, and phone are required')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const response = await authService.register({
        email: formData.email,
        admission_number: formData.admission_number,
        phone: formData.phone,
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: formData.role
      })
      setCookie('pst_access_token', response.data.access)
      setCookie('pst_refresh_token', response.data.refresh)
      setToken(response.data.access)
      setUser(response.data.user)
      toast.success('Registration successful! Redirecting to dashboard...')
      const destination = getHomePath(response.data.user?.role)
      navigate(destination, { replace: true })
    } catch (error) {
      const errMsg = error.response?.data?.detail ||
                     error.response?.data?.email?.[0] ||
                     error.response?.data?.admission_number?.[0] ||
                     error.response?.data?.phone?.[0] ||
                     error.message ||
                     'Registration failed'
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'input-field text-sm'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
         className="flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-brand)' }}>
              <span className="font-bold text-lg text-text-inverse">PST</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PST</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tracker</p>
            </div>
          </div>
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
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Join the Postgraduate Submissions Tracker</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="panel">
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={inputCls} placeholder="student@university.edu" required />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Admission Number *</label>
              <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange}
                className={inputCls} placeholder="e.g., PG/2024/001" required />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.slice(0, 20) }))}
                className={inputCls} placeholder="+254 701 618 286 (max 20 chars)" maxLength="20" required />
              <p className="text-xs mt-1" style={{ color: formData.phone.length > 15 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
                {formData.phone.length}/20 characters
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                className={inputCls} placeholder="John" />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                className={inputCls} placeholder="Doe" />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} className={inputCls}>
                <option value="student">Student</option>
                <option value="supervisor">Supervisor</option>
                <option value="coordinator">Coordinator</option>
                <option value="dean">Dean</option>
                <option value="cod">COD</option>
                <option value="director_bps">Director BPS</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Password (min 8 chars) *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className={inputCls} placeholder="Enter secure password" required />
              <p className="text-xs mt-1" style={{ color: formData.password.length < 8 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {formData.password.length < 8 ? `${8 - formData.password.length} more characters needed` : 'Password length requirement met'}
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Confirm Password *</label>
              <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange}
                className={inputCls} placeholder="Confirm password" required />
              <p className="text-xs mt-1" style={{ color: formData.password !== formData.password_confirm && formData.password_confirm ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {formData.password !== formData.password_confirm && formData.password_confirm ? 'Passwords do not match' : 'Passwords match'}
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary font-semibold mt-6"
                    style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)' }}>
                Sign In
              </Link>
            </p>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 panel">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <strong>Note:</strong> You'll need an admission number to register. Contact your institution if you don't have one.
          </p>
        </div>
      </div>
    </div>
  )
}
