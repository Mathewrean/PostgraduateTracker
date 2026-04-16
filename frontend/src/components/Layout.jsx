import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useAuth'
import { useUIStore, useAuthStore } from '../context/store'

export const Layout = ({ children }) => {
  const isDark = useUIStore((state) => state.isDark)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white'
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const sidebarBg = isDark ? 'bg-gray-800' : 'bg-white'

  return (
    <div className={`flex h-screen ${bgColor} ${textColor}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className="flex-1 overflow-auto flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export const Sidebar = ({ isOpen }) => {
  const { user } = useCurrentUser()
  const isDark = useUIStore((state) => state.isDark)
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'

  if (!user) return null
  
  const menuItems = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Profile', path: '/profile' },
      { label: 'Current Stage', path: '/stage' },
      { label: 'Activities', path: '/activities' },
      { label: 'Documents', path: '/documents' },
    ],
    SUPERVISOR: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Students', path: '/students' },
      { label: 'Approvals', path: '/approvals' },
    ],
    COORDINATOR: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'All Students', path: '/students' },
      { label: 'Reports', path: '/reports' },
      { label: 'Complaints', path: '/complaints' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/users' },
      { label: 'System Settings', path: '/settings' },
    ],
  }
  
  const items = menuItems[user.role] || []
  
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} ${bgColor} border-r ${borderColor} transition-all duration-300 overflow-hidden`}>
      <div className="p-6 border-b border-gray-700">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
          <span className="text-white font-bold">PST</span>
        </div>
        <h2 className="text-lg font-bold">PST</h2>
        <p className="text-sm opacity-75">{user.role}</p>
      </div>
      
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${hoverBg}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className={`w-full px-4 py-2 rounded-lg transition-colors ${hoverBg}`}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export const Header = ({ onToggleSidebar }) => {
  const { user } = useCurrentUser()
  const unreadCount = useUIStore((state) => state.unreadCount)
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200'

  return (
    <header className={`border-b ${borderColor} transition-colors duration-200`}>
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Menu
        </button>

        <h2 className="flex-1 text-lg font-semibold px-4">Dashboard</h2>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            Notifications
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'}`}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>

          <div className="text-sm">
            <p className="font-semibold">{user?.first_name || 'User'}</p>
            <p className="text-xs opacity-75">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
