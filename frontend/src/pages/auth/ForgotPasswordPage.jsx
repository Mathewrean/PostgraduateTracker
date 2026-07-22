import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services'
import { TopbarBrand } from '../../components/TopbarBrand'
import toast from 'react-hot-toast'

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.requestPasswordReset(email)
      setSubmitted(true)
      toast.success('If that email exists, a reset code has been sent.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Request failed')
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
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Reset your password</h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter your email and we'll send you a reset code.
        </p>

        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If an account exists for <strong>{email}</strong>, check your inbox for the reset code.
            </p>
            <Link to="/reset-password" state={{ email }} className="btn-primary block text-center">
              Enter reset code
            </Link>
            <Link to="/login" className="block text-center text-sm" style={{ color: 'var(--color-brand)' }}>
              Back to login
            </Link>
          </div>
        ) : (
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
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset code'}
            </button>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Remember your password? <Link to="/login" style={{ color: 'var(--color-brand)' }}>Log in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
