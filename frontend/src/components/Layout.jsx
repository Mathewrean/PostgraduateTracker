import React from 'react'
import { useCurrentUser } from '../hooks/useAuth'
import { useUIStore } from '../context/store'

export const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export const Sidebar = () => {
  const { user } = useCurrentUser()
  
  if (!user) return null
  
  const menuItems = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Profile', path: '/student/profile' },
      { label: 'Current Stage', path: '/student/stage' },
      { label: 'Activities', path: '/student/activities' },
      { label: 'Documents', path: '/student/documents' },
      { label: 'Notifications', path: '/student/notifications' },
    ],
    SUPERVISOR: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Students', path: '/supervisor/students' },
      { label: 'Approvals', path: '/supervisor/approvals' },
    ],
    COORDINATOR: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'All Students', path: '/coordinator/students' },
      { label: 'Reports', path: '/coordinator/reports' },
      { label: 'Complaints', path: '/coordinator/complaints' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Reports', path: '/admin/reports' },
      { label: 'Audit Logs', path: '/admin/audit' },
    ],
  }
  
  const items = menuItems[user.role] || []
  
  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">PST</h1>
        <p className="text-sm text-gray-600 mt-2">{user.role}</p>
      </div>
      <nav className="mt-8">
        {items.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-r-4 border-transparent hover:border-blue-600 transition"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export const Header = () => {
  const { unreadCount } = useUIStore()
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <h2 className="text-gray-800 text-lg">Postgraduate Submissions Tracker</h2>
        <div className="flex items-center gap-4">
          <button className="relative">
            <span className="text-gray-600">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="text-gray-600">👤</button>
        </div>
      </div>
    </header>
  )
}
