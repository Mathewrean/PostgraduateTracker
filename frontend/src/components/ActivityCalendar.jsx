import React, { useState, useEffect } from 'react'
import { activityService } from '../services'
import { useUIStore } from '../context/store'

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const ActivityCalendar = ({ stageId }) => {
  const isDark = useUIStore((s) => s.isDark)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await activityService.getCalendar(stageId)
        setActivities(asList(response.data))
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [stageId])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success'
      case 'PLANNED':
        return 'badge-primary'
      default:
        return 'badge-muted'
    }
  }

  if (loading) return <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}><p style={{ color: 'var(--text-secondary)' }}>Loading calendar...</p></div>

  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Activity Calendar</h3>

      {activities.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No activities scheduled</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className={`p-3 rounded border ${getStatusClass(activity.status)}`} style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>{activity.description}</p>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <p className="font-medium">{formatDate(activity.planned_date)}</p>
                  <p style={{ opacity: 0.75 }}>{activity.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
