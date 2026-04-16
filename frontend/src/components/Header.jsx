import React, { useEffect, useState } from 'react'
import { useUIStore } from '../context/store'

export const HeaderComponent = ({ title = 'PST Application', stage = null, user = null }) => {
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark
          ? `${scrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-800'} border-gray-700`
          : `${scrolled ? 'bg-white shadow-lg' : 'bg-gray-50'} border-gray-100`
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Title & Stage */}
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
            >
              {title}
            </h1>
            {stage && (
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Current Stage: <span className="font-semibold text-blue-500">{stage}</span>
              </p>
            )}
          </div>

          {/* Right: User & Theme Toggle */}
          <div className="flex items-center gap-4">
            {user && (
              <div
                className={`text-right hidden sm:block ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <p className="text-sm font-semibold">{user.first_name || 'User'}</p>
                <p className="text-xs opacity-70">{user.role}</p>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Toggle theme"
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.39 0l.707.707a1 1 0 01-1.39 1.39L15.22 4.22a1 1 0 010-1.39zm2.83 2.83a1 1 0 01-1.39 1.39l-.707-.707a1 1 0 011.39-1.39l.707.707zm0 2.83a1 1 0 01-1.39-1.39l.707-.707a1 1 0 011.39 1.39l-.707.707zM10 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
