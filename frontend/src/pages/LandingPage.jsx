import React from 'react'
import { useNavigate } from 'react-router-dom'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl mx-auto text-white text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">📚 PST</h1>
          <h2 className="text-3xl font-semibold mb-2">Postgraduate Submissions Tracker</h2>
          <p className="text-xl opacity-90">
            Managing postgraduate research submissions with confidence
          </p>
        </div>

        {/* Institution Info */}
        <div className="mb-12 bg-white/10 backdrop-blur-md rounded-lg p-6">
          <p className="text-lg mb-2">
            <strong>Jomo Kenyatta University of Agriculture and Technology</strong>
          </p>
          <p className="text-base opacity-95 mb-2">
            School of Biological, Physical, Mathematics and Actuarial Sciences
          </p>
          <p className="text-base opacity-90">
            Department of Pure and Applied Mathematics
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition">
            <h3 className="text-2xl mb-2">📊 Track Progress</h3>
            <p className="text-sm opacity-90">Monitor your research submission stages in real-time</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition">
            <h3 className="text-2xl mb-2">📤 Upload Documents</h3>
            <p className="text-sm opacity-90">Submit PDF, Word, PowerPoint presentations easily</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition">
            <h3 className="text-2xl mb-2">📅 Plan Activities</h3>
            <p className="text-sm opacity-90">Organize and track research activities with calendar</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition">
            <h3 className="text-2xl mb-2">📈 Get Insights</h3>
            <p className="text-sm opacity-90">Access detailed reports and analytics for your work</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/login')}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105 mb-8"
        >
          Login to Get Started
        </button>

        {/* Test Accounts Info */}
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 text-left max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center">🧪 Demo Accounts</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">👤 Student</p>
              <p className="opacity-90">Email: <code>student@test.com</code> | Password: <code>student123</code></p>
            </div>
            <div>
              <p className="font-semibold">👨‍🏫 Supervisor</p>
              <p className="opacity-90">Email: <code>supervisor@test.com</code> | Password: <code>supervisor123</code></p>
            </div>
            <div>
              <p className="font-semibold">📋 Coordinator</p>
              <p className="opacity-90">Email: <code>coordinator@test.com</code> | Password: <code>coordinator123</code></p>
            </div>
            <div>
              <p className="font-semibold">🔑 Admin</p>
              <p className="opacity-90">Email: <code>admin@pst.com</code> | Password: <code>admin123</code></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm opacity-75">
          <p>Version 1.0 • Assessment & Postgraduate Studies Unit</p>
          <p className="mt-2">For support, contact: pst-support@university.ac.ke</p>
        </div>
      </div>
    </div>
  )
}
