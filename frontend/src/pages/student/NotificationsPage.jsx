import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { notificationService } from '../../services'

export const NotificationsPage = () => {
  const navigate = useNavigate()
  const { notificationId } = useParams()
  const [notifications, setNotifications] = useState([])
  const [notificationDetail, setNotificationDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (notificationId) {
      fetchNotificationDetail(notificationId)
    } else {
      fetchNotifications()
    }
  }, [notificationId])

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      const sorted = data.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      setNotifications(sorted)
    } catch (error) {
      setMessage('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationDetail = async (id) => {
    try {
      const response = await notificationService.getById(id)
      setNotificationDetail(response.data)
    } catch (error) {
      setMessage('Failed to load notification detail')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (error) {
      setMessage('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      setMessage('Failed to mark notifications as read')
    }
  }

  if (loading) return (
    <Layout title="Notifications">
      <div className="flex justify-center items-center h-64">
        <p>Loading notifications...</p>
      </div>
    </Layout>
  )

  if (notificationId && notificationDetail) {
    return (
      <Layout title="Notification Detail">
        <div className="space-y-6 max-w-3xl">
          <button onClick={() => navigate('/notifications')} className="btn-secondary">
            Back to Notifications
          </button>
          {message && <div className="alert-danger">{message}</div>}
          <div className="panel space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Notification</h1>
                <p className="text-sm text-text-secondary">
                  {new Date(notificationDetail.created_at).toLocaleString()}
                </p>
              </div>
              <span className="badge-info">
                {notificationDetail.notification_type?.replaceAll('_', ' ')}
              </span>
            </div>
            <p>{notificationDetail.message}</p>
            {notificationDetail.link && (
              <button
                onClick={() => navigate(notificationDetail.link.startsWith('/api/')
                  ? '/dashboard'
                  : notificationDetail.link)}
                className="btn-primary"
              >
                Open Related Record
              </button>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary">
              Mark All as Read
            </button>
          )}
        </div>
        {message && <div className="alert-danger">{message}</div>}

        {notifications.length === 0 ? (
          <p className="text-text-secondary">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`panel ${notification.is_read ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start">
                  <button
                    onClick={() => navigate(`/notifications/${notification.id}`)}
                    className="text-left flex-1"
                  >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(notification.updated_at || notification.created_at).toLocaleString()}
                    </p>
                  </button>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn-ghost"
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
