import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useUIStore } from '../../context/store'
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
    role: 'STUDENT'
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
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
      
      toast.success('Registration successful! Please login.')
      navigate('/login')
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

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center p-4 transition-colors duration-200`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PST</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PST</h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tracker</p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'} transition-colors duration-200`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Join the Postgraduate Submissions Tracker</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className={`${cardBg} p-8 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="student@university.edu"
                required
              />
            </div>

            {/* Admission Number */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Admission Number *</label>
              <input
                type="text"
                name="admission_number"
                value={formData.admission_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="e.g., PG/2024/001"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="+254 7XX XXX XXX"
                required
              />
            </div>

            {/* First Name */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="Doe"
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Password (min 8 chars) *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="Enter secure password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block ${labelColor} font-medium mb-2 text-sm`}>Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-sm`}
                placeholder="Confirm password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold transition-colors duration-200 mt-6"
            >
              {loading ? '⏳ Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </form>

        {/* Info */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${isDark ? 'border-gray-700' : 'border-blue-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Note:</strong> You'll need an admission number to register. Contact your institution if you don't have one.
          </p>
        </div>
      </div>
    </div>
  )
}
