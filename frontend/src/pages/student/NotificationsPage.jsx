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

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  if (loading) return (
    <Layout title="Notifications">
      <div className="flex justify-center items-center h-64">
        <p className="text-text-primary">Loading notifications...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
        {notifications.length === 0 ? (
          <p className="text-text-muted">No notifications.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border panel ${notif.is_read ? 'bg-bg-secondary border-border-primary' : 'bg-accent/10 border-accent'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-text-primary">{notif.message}</p>
                    <p className="text-sm text-text-muted">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                    {notif.link && (
                      <a href={notif.link} className="text-accent text-sm hover:underline">View details</a>
                    )}
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm bg-accent hover:bg-accent/90 text-text-primary px-3 py-1 rounded"
                    >
                      Mark read
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
