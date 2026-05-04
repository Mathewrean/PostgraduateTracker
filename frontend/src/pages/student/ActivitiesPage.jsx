import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { ActivityCalendar } from '../../components/ActivityCalendar'
import { activityService, stageService } from '../../services'
import { useAuthStore } from '../../context/store'

export const ActivitiesPage = () => {
  const user = useAuthStore((state) => state.user)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newActivity, setNewActivity] = useState({
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
      const [stageResponse, response] = await Promise.all([
        stageService.getCurrentStage(),
        activityService.getAll()
      ])
      setCurrentStage(stageResponse.data)
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
      await activityService.create({ ...newActivity, stage: currentStage?.id })
      setMessage({ type: 'success', text: 'Activity created successfully' })
      setShowForm(false)
      setNewActivity({ title: '', description: '', planned_date: '' })
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading activities...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Activities">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Activities</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>{showForm ? 'Cancel' : 'Add Activity'}</button>
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>New Activity</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Current stage: {currentStage?.stage_type || user?.current_stage || 'Concept'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input type="text" name="title" value={newActivity.title} onChange={handleInputChange} required className="w-full" style={{ border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea name="description" value={newActivity.description} onChange={handleInputChange} className="w-full" style={{ border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Planned Date</label>
                <input type="datetime-local" name="planned_date" value={newActivity.planned_date} onChange={handleInputChange} required className="w-full" style={{ border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px' }} />
              </div>
              <button type="submit" className="btn-success" style={{ padding: '0.5rem 1rem' }}>Create Activity</button>
            </form>
          </div>
        )}

        {currentStage?.id && (
          <ActivityCalendar stageId={currentStage.id} />
        )}

        <div className="grid gap-4">
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No activities found.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-4 rounded-lg border" style={{ backgroundColor: activity.status === 'COMPLETED' ? 'rgba(46,125,50,0.04)' : 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{activity.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activity.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Planned: {new Date(activity.planned_date).toLocaleString()}
                    </p>
                    <p className="text-xs">Status: <span className={`font-semibold`} style={{ color: activity.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-warning)' }}>{activity.status}</span></p>
                    {activity.created_by_email && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Created by: {activity.created_by_email}</p>
                    )}
                  </div>
                  {activity.status !== 'COMPLETED' && (
                    <button onClick={() => handleMarkDone(activity.id)} className="btn-success" style={{ padding: '0.25rem 0.5rem' }}>Mark Done</button>
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
