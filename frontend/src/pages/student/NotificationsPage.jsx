import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { notificationService } from '../../services'

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  if (loading) return (
    <Layout title="Notifications">
      <div className="flex justify-center items-center h-64">
        <p>Loading notifications...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary">
              Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'opacity-60' : ''}`}
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}