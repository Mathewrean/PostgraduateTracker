import React, { useEffect, useState } from 'react'
import { TopbarBrand } from './TopbarBrand'

export const HeaderComponent = ({ title = 'PST Application', stage = null, user = null }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`app-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <TopbarBrand compact />
            <div className="min-w-0">
              <h1 className="app-title truncate">{title}</h1>
              {stage && (
                <p className="app-stage-pill">
                  Current Stage: <strong>{stage}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary">{user.first_name || 'User'}</p>
                <p className="chip mt-1">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
