import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { activityService } from '../../services'
import { useAuthStore } from '../../context/store'

export const ActivitiesPage = () => {
  const user = useAuthStore((state) => state.user)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newActivity, setNewActivity] = useState({
    stage: '',
    title: '',
    description: '',
    planned_date: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await activityService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      await activityService.create(newActivity)
      setMessage({ type: 'success', text: 'Activity created successfully' })
      setShowForm(false)
      setNewActivity({ stage: '', title: '', description: '', planned_date: '' })
      fetchActivities()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create activity' })
    }
  }

  const handleMarkDone = async (activityId) => {
    try {
      await activityService.markDone(activityId)
      fetchActivities()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to mark activity as done' })
    }
  }

  if (loading) return (
    <Layout title="Activities">
      <div className="flex justify-center items-center h-64">
        <p>Loading activities...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Activities">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Activities</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : 'Add Activity'}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">New Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newActivity.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Planned Date</label>
                <input
                  type="datetime-local"
                  name="planned_date"
                  value={newActivity.planned_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Create Activity
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {activities.length === 0 ? (
            <p className="text-gray-500">No activities found.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className={`p-4 rounded-lg border ${activity.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{activity.title}</h3>
                    <p className="text-gray-600 text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Planned: {new Date(activity.planned_date).toLocaleString()}
                    </p>
                    <p className="text-xs">Status: <span className={`font-semibold ${activity.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>{activity.status}</span></p>
                    {activity.created_by_email && (
                      <p className="text-xs text-gray-500">Created by: {activity.created_by_email}</p>
                    )}
                  </div>
                  {activity.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleMarkDone(activity.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
