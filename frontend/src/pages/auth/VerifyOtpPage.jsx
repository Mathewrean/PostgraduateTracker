import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TopbarBrand } from '../../components/TopbarBrand'
import { authService } from '../../services'
import { setCookie } from '../../services/api'
import { useAuthStore, useUIStore } from '../../context/store'
import { getHomePath } from '../../utils/navigation'

export const VerifyOtpPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    if (!email || otp.length !== 6) {
      setErrorMessage('Enter your email and 6-digit code')
      return
    }
    setLoading(true)
    try {
      const response = await authService.verifyOtp(email, otp)
      setCookie('pst_access_token', response.data.access)
      setCookie('pst_refresh_token', response.data.refresh)
      setToken(response.data.access)
      setUser(response.data.user)
      toast.success('Account verified successfully')
      navigate(getHomePath(response.data.user?.role), { replace: true })
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setErrorMessage('')
    if (!email) {
      setErrorMessage('Enter your email first')
      return
    }
    setResending(true)
    try {
      const response = await authService.resendOtp(email)
      toast.success(response.data?.message || 'Verification code resent')
      setResendCooldown(60)
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Could not resend code')
    } finally {
      setResending(false)
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Verify Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter the code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-5">
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field tracking-widest"
              inputMode="numeric"
              placeholder="123456"
              required
            />
            {errorMessage && (
              <p className="text-sm mt-2" style={{ color: 'var(--color-danger)' }}>
                {errorMessage}
              </p>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary font-semibold" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Verifying...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="w-full btn-secondary font-semibold"
            style={{ opacity: resending || resendCooldown > 0 ? 0.6 : 1 }}
          >
            {resending ? 'Sending...' : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
          </button>
        </form>

        <div className="mt-6 panel text-center">
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
