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
    <header className={`sticky top-0 z-50 transition-all duration-300`} style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', boxShadow: scrolled ? '0 6px 20px var(--shadow)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Title & Stage */}
          <div className="flex-1">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand)' }}>{title}</h1>
            {stage && (
              <p
                style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}
              >
                Current Stage: <span style={{ fontWeight: 700, color: 'var(--color-brand)' }}>{stage}</span>
              </p>
            )}
          </div>

          {/* Right: User & Theme Toggle */}
          <div className="flex items-center gap-4">
            {user && (
              <div style={{ textAlign: 'right', display: 'none', gap: '0.25rem' }} className="sm:block">
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.first_name || 'User'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.85 }}>{user.role}</p>
                </div>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme} style={{ padding: '0.5rem', borderRadius: '0.5rem', transition: 'all 0.2s ease', backgroundColor: 'transparent', color: 'var(--color-gold)' }} title="Toggle theme">
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.39 0l.707.707a1 1 0 01-1.39 1.39L15.22 4.22a1 1 0 010-1.39zm2.83 2.83a1 1 0 01-1.39 1.39l-.707-.707a1 1 0 011.39-1.39l.707.707zm0 2.83a1 1 0 01-1.39-1.39l.707-.707a1 1 0 011.39 1.39l-.707.707zM10 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
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
