import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { useUIStore } from '../context/store'

export const NavbarComponent = () => {
  const navigate = useNavigate()
  const isDark = useUIStore((state) => state.isDark)
  const user = useAuthStore((state) => state.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Documents', action: 'documents' , icon: '📄' },
    { label: 'Activities', action: 'activities', icon: '✅' },
    { label: 'Reports', action: 'reports', icon: '📈' },
  ]

  return (
    <nav
      className={`${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-b transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isDark
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu & Logout */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {menuOpen ? '✕' : '☰'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                isDark
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className={`md:hidden pb-4 flex flex-col gap-2 ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.path && navigate(item.path)
                  setMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  isDark
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
