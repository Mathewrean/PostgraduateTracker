import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { useUIStore } from '../context/store'
import { authService, notificationService } from '../services'
import { getCookie } from '../services/api'

export const NavbarComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const user = useAuthStore((state) => state.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return
      try {
        const response = await notificationService.getUnreadCount()
        setUnreadCount(response.data?.unread_count || 0)
      } catch (error) {
        setUnreadCount(0)
      }
    }

    fetchUnread()
  }, [user])

  const handleLogout = async () => {
    const refreshToken = getCookie('pst_refresh_token')
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (error) {
        // Continue with local logout even if the refresh token is already invalid.
      }
    }
    logout()
    navigate('/login')
  }

  const getUserNavItems = () => {
    const role = user?.role
    const base = [{ label: 'Dashboard', path: '/dashboard' }]
    if (role === 'student') {
      return base.concat([
        { label: 'Documents', path: '/documents' },
        { label: 'Activities', path: '/activities' },
        { label: 'Notifications', path: '/notifications' },
        { label: 'Messages', path: '/messages' },
        { label: 'Profile', path: '/profile' }
      ])
    } else if (role === 'supervisor') {
      return base.concat([
        { label: 'My Students', path: '/supervisor/students' },
        { label: 'Pending Approvals', path: '/supervisor/approvals' },
        { label: 'Notifications', path: '/notifications' }
      ])
    } else if (['coordinator', 'dean', 'cod', 'director_bps'].includes(role)) {
      return base.concat([
        { label: 'All Students', path: '/coordinator/students' },
        { label: 'Assign Supervisors', path: '/coordinator/assign' },
        { label: 'Complaints', path: '/coordinator/complaints' },
        { label: 'Reports', path: '/coordinator/reports' },
        { label: 'Notifications', path: '/notifications' },
        ...(['dean', 'cod', 'director_bps'].includes(role) ? [{ label: 'Audit Logs', path: '/admin/audit' }, { label: 'User Activity', path: '/admin/activity' }] : [])
      ])
    }
    return base
  }

  const navItems = getUserNavItems()

  return (
    <nav className={`app-nav border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold ${location.pathname === item.path ? 'bg-bg-tertiary text-brand' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu & Logout */}
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative px-3 py-2 text-sm font-semibold"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full badge-warning text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTheme()
                }
              }}
              onClick={() => toggleTheme()}
              className="theme-toggle"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-secondary md:hidden"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-danger"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden pb-4 flex flex-col gap-2 border-t border-border-primary`}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.path && navigate(item.path)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
