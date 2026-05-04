import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../context/store'

export const LandingPage = () => {
  const navigate = useNavigate()
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const secondaryTextStyle = { color: 'var(--text-secondary)' }
  const cardStyle = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand)' }}>
              <span style={{ color: 'var(--bg-main)', fontWeight: 700, fontSize: '1.125rem' }}>PST</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>PST</h1>
              <p className="text-sm" style={secondaryTextStyle}>Postgraduate Submissions Tracker</p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--color-gold)' }}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Postgraduate Submissions Tracker</h2>
                <p className="text-lg mb-8" style={secondaryTextStyle}>
                  Manage your academic journey with confidence. Track submissions, communicate with supervisors, and stay on top of every milestone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary px-8 py-3 text-lg font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-outline-brand px-8 py-3 text-lg font-semibold"
                  >
                    Register
                  </button>
                </div>
              </div>
              <div className="p-8 rounded-lg" style={cardStyle}>
                <div className="space-y-4">
                  <div className="p-4 rounded" style={{ borderLeft: '4px solid var(--color-brand)', backgroundColor: isDark ? 'var(--bg-surface)' : 'var(--bg-main)' }}>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Student</h3>
                    <p style={secondaryTextStyle}>Track your progress through each stage</p>
                  </div>
                  <div className="p-4 rounded" style={{ borderLeft: '4px solid var(--color-success)', backgroundColor: isDark ? 'var(--bg-surface)' : 'var(--bg-main)' }}>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Supervisor</h3>
                    <p style={secondaryTextStyle}>Review and approve student submissions</p>
                  </div>
                  <div className="p-4 rounded" style={{ borderLeft: '4px solid var(--color-info)', backgroundColor: isDark ? 'var(--bg-surface)' : 'var(--bg-main)' }}>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Coordinator</h3>
                    <p style={secondaryTextStyle}>Manage all students and generate reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institution Info */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Institution Information</h3>
              <p style={secondaryTextStyle}>Serving excellence in higher education</p>
            </div>
            <div className="p-8 rounded-lg border max-w-2xl mx-auto text-center" style={cardStyle}>
              <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Jaramogi Oginga Odinga University of Science and Technology</h4>
              <p style={{ ...secondaryTextStyle, marginBottom: '0.5rem' }}>School of Sciences and Technology</p>
              <p style={secondaryTextStyle}>Department of Computer Science and Information Technology</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Key Features</h3>
              <p style={secondaryTextStyle}>Everything you need to manage your postgraduate journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Progress Tracking', desc: 'Monitor your submission stages' },
                { title: 'Document Upload', desc: 'Upload and manage documents' },
                { title: 'Activity Planning', desc: 'Plan and track activities' },
                { title: 'Analytics', desc: 'View detailed insights and reports' },
              ].map((feature, idx) => (
                <div key={idx} className="p-6 rounded-lg border" style={{ ...cardStyle }}>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h4>
                  <p style={secondaryTextStyle}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Test Accounts Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Test Accounts</h3>
              <p style={secondaryTextStyle}>Try the application with pre-configured accounts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { role: 'Student', email: 'student@test.com', pass: 'student123' },
                { role: 'Student', email: 'student@example.com', pass: 'password123' },
                { role: 'Supervisor', email: 'supervisor@test.com', pass: 'supervisor123' },
                { role: 'Coordinator', email: 'coordinator@test.com', pass: 'coordinator123' },
                { role: 'Admin', email: 'admin@pst.com', pass: 'admin123' },
              ].map((account, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={cardStyle}>
                  <p className="text-sm font-semibold w-fit px-2 py-1 rounded mb-2" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>{account.role}</p>
                  <p className="text-sm font-mono" style={{ ...secondaryTextStyle, wordBreak: 'break-all', marginBottom: '0.25rem' }}>{account.email}</p>
                  <p className="text-sm font-mono" style={secondaryTextStyle}>{account.pass}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ready to get started?</h3>
            <p style={{ ...secondaryTextStyle, marginBottom: '2rem', fontSize: '1.125rem' }}>Login now to access your dashboard and start managing your submissions.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-12 py-4 text-lg font-semibold"
            >
              Login to Your Account
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p style={secondaryTextStyle}>© 2026 Postgraduate Submissions Tracker. All rights reserved.</p>
          <p className="text-sm" style={{ ...secondaryTextStyle, marginTop: '0.5rem' }}>Jaramogi Oginga Odinga University of Science and Technology</p>
        </div>
      </footer>
    </div>
  )
}
