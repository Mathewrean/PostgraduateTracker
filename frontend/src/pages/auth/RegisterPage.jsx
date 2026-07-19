import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useUIStore } from '../../context/store'
import { TopbarBrand } from '../../components/TopbarBrand'
import toast from 'react-hot-toast'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    admission_number: '',
    phone: '',
    password: '',
    password_confirm: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value === 'lecturer' ? { admission_number: '' } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Full name, email, and phone are required')
      return
    }
    if (formData.role === 'student' && !formData.admission_number) {
      toast.error('Admission number is required for students')
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
        full_name: formData.full_name,
        email: formData.email,
        admission_number: formData.role === 'student' ? formData.admission_number : '',
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: formData.role
      })
      toast.success('Registration successful. You can now log in.')
      navigate('/login', { replace: true })
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
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Join the Postgraduate Submissions Tracker</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="panel">
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Full Name *</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                className={inputCls} placeholder="John Doe" required />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={inputCls} placeholder="student@university.edu" required />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} className={inputCls}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="block font-medium mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Admission Number *</label>
                <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange}
                  className={inputCls} placeholder="e.g., PG/2024/001" required />
              </div>
            )}

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

      </div>
    </div>
  )
}
