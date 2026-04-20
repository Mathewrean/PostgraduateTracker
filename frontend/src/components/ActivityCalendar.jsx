import React, { useState, useEffect } from 'react'
import { activityService } from '../services'

const asList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  return []
}

export const ActivityCalendar = ({ stageId, isDark = false }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
        <p className={textColor}>Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
      <h3 className="text-xl font-bold mb-4">Activity Calendar</h3>
      
      {activities.length === 0 ? (
        <p className={textColor}>No activities scheduled</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded border ${getStatusColor(activity.status)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs mt-1 opacity-80">{activity.description}</p>
                  )}
                </div>
                <div className="text-xs">
                  <p className="font-medium">{formatDate(activity.planned_date)}</p>
                  <p className="opacity-75">{activity.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
