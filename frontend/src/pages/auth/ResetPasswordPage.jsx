import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services'
import { TopbarBrand } from '../../components/TopbarBrand'
import toast from 'react-hot-toast'

export const ResetPasswordPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const emailFromState = location.state?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password', { replace: true })
    }
  }, [emailFromState, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authService.confirmPasswordReset({
        email,
        otp,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      })
      toast.success(response.data?.message || 'Password has been reset.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md p-8 panel">
        <div className="flex justify-center mb-6">
          <TopbarBrand compact />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Set a new password</h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter the code sent to your email and choose a new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reset code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field"
              placeholder="6-digit code"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Repeat new password"
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Remember it? <Link to="/login" style={{ color: 'var(--color-brand)' }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
