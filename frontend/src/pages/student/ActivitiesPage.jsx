import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { ActivityCalendar } from '../../components/ActivityCalendar'
import { activityService, stageService } from '../../services'
import { useAuthStore } from '../../context/store'

export const ActivitiesPage = () => {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)
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
      const stageResponse = await stageService.getCurrentStage()
      setCurrentStage(stageResponse.data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch activities' })
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
      setCalendarRefreshKey((key) => key + 1)
      fetchActivities()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create activity' })
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
          <ActivityCalendar stageId={currentStage.id} refreshKey={calendarRefreshKey} />
        )}
      </div>
    </Layout>
  )
}
