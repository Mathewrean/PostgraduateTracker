import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../context/store'

export const LandingPage = () => {
  const navigate = useNavigate()
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const secondaryText = isDark ? 'text-gray-300' : 'text-gray-600'
  const accentColor = 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-200`}>
      {/* Header */}
      <header className={`border-b ${borderColor} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PST</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PST</h1>
              <p className={`text-sm ${secondaryText}`}>Postgraduate Submissions Tracker</p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'} transition-colors duration-200`}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className={`border-b ${borderColor} transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Postgraduate Submissions Tracker</h2>
                <p className={`text-lg ${secondaryText} mb-8`}>
                  Manage your academic journey with confidence. Track submissions, communicate with supervisors, and stay on top of every milestone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className={`${accentColor} text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className={`border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200`}
                  >
                    Register
                  </button>
                </div>
              </div>
              <div className={`p-8 rounded-lg ${cardBg} border ${borderColor}`}>
                <div className="space-y-4">
                  <div className={`p-4 rounded border-l-4 border-blue-600 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <h3 className="font-semibold mb-1">Student</h3>
                    <p className={secondaryText}>Track your progress through each stage</p>
                  </div>
                  <div className={`p-4 rounded border-l-4 border-green-600 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <h3 className="font-semibold mb-1">Supervisor</h3>
                    <p className={secondaryText}>Review and approve student submissions</p>
                  </div>
                  <div className={`p-4 rounded border-l-4 border-purple-600 ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <h3 className="font-semibold mb-1">Coordinator</h3>
                    <p className={secondaryText}>Manage all students and generate reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institution Info */}
        <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Institution Information</h3>
              <p className={secondaryText}>Serving excellence in higher education</p>
            </div>
            <div className={`${cardBg} p-8 rounded-lg border ${borderColor} max-w-2xl mx-auto text-center`}>
              <h4 className="text-xl font-semibold mb-2">Jaramogi Oginga Odinga University of Science and Technology</h4>
              <p className={`${secondaryText} mb-2`}>School of Sciences and Technology</p>
              <p className={`${secondaryText}`}>Department of Computer Science and Information Technology</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2">Key Features</h3>
              <p className={secondaryText}>Everything you need to manage your postgraduate journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Progress Tracking', desc: 'Monitor your submission stages' },
                { title: 'Document Upload', desc: 'Upload and manage documents' },
                { title: 'Activity Planning', desc: 'Plan and track activities' },
                { title: 'Analytics', desc: 'View detailed insights and reports' },
              ].map((feature, idx) => (
                <div key={idx} className={`${cardBg} p-6 rounded-lg border ${borderColor} hover:border-blue-500 transition-colors duration-200`}>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className={secondaryText}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Test Accounts Section */}
        <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2">Test Accounts</h3>
              <p className={secondaryText}>Try the application with pre-configured accounts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { role: 'Student', email: 'student@test.com', pass: 'student123', badgeClass: 'bg-blue-100 text-blue-800' },
                { role: 'Student', email: 'student@example.com', pass: 'password123', badgeClass: 'bg-blue-100 text-blue-800' },
                { role: 'Supervisor', email: 'supervisor@test.com', pass: 'supervisor123', badgeClass: 'bg-green-100 text-green-800' },
                { role: 'Coordinator', email: 'coordinator@test.com', pass: 'coordinator123', badgeClass: 'bg-purple-100 text-purple-800' },
                { role: 'Admin', email: 'admin@pst.com', pass: 'admin123', badgeClass: 'bg-red-100 text-red-800' },
              ].map((account, idx) => (
                <div key={idx} className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
                  <p className={`text-sm font-semibold ${account.badgeClass} w-fit px-2 py-1 rounded mb-2`}>{account.role}</p>
                  <p className={`text-sm font-mono ${secondaryText} break-all mb-1`}>{account.email}</p>
                  <p className={`text-sm font-mono ${secondaryText}`}>{account.pass}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
            <p className={`${secondaryText} mb-8 text-lg`}>Login now to access your dashboard and start managing your submissions.</p>
            <button
              onClick={() => navigate('/login')}
              className={`${accentColor} text-white px-12 py-4 rounded-lg text-lg font-semibold transition-colors duration-200`}
            >
              Login to Your Account
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${borderColor} ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className={secondaryText}>© 2026 Postgraduate Submissions Tracker. All rights reserved.</p>
          <p className={`text-sm ${secondaryText} mt-2`}>Jaramogi Oginga Odinga University of Science and Technology</p>
        </div>
      </footer>
    </div>
  )
}
