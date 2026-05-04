import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { useUIStore } from '../context/store'
import { authService, notificationService } from '../services'
import { getCookie } from '../services/api'

export const NavbarComponent = () => {
  const navigate = useNavigate()
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isDark
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
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
                className={`relative px-3 py-2 rounded-lg text-sm ${
                  isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full badge-warning text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {/* Theme toggle */}
            <div
              role="switch"
              aria-checked={isDark}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTheme()
                }
              }}
              onClick={() => toggleTheme()}
              className="theme-toggle"
              data-checked={isDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="thumb" aria-hidden="true" />
            </div>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 btn-danger"
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
                className={`w-full text-left px-4 py-2 rounded-lg transition-all`}
                style={{ color: 'var(--text-primary)' }}
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
