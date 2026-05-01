import React, { useEffect, useState } from 'react'

import { Layout } from '../../components/Layout'
import { meetingService, studentService } from '../../services'

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([])
  const [profile, setProfile] = useState(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchData = async () => {
    try {
      const [meetingsResponse, profileResponse] = await Promise.all([
        meetingService.getAll(),
        studentService.getProfile(),
      ])
      setMeetings(asList(meetingsResponse.data))
      setProfile(profileResponse.data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load meetings.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      await meetingService.create({
        supervisor: profile?.assigned_supervisor || undefined,
        scheduled_date: scheduledDate,
        notes,
      })
      setMessage({ type: 'success', text: 'Meeting request sent.' })
      setScheduledDate('')
      setNotes('')
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to request meeting.' })
    }
  }

  if (loading) {
    return (
      <Layout title="Meetings">
        <div className="flex justify-center items-center h-64"><p>Loading meetings...</p></div>
      </Layout>
    )
  }

  return (
    <Layout title="Meetings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule Meeting</h1>
          <p className="text-gray-600">
            Assigned supervisor: {profile?.assigned_supervisor_name || 'Not assigned yet'}
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white p-6 rounded shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border rounded p-2"
                placeholder="Add meeting agenda or context"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Request Meeting
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Meeting Requests</h2>
          {meetings.length === 0 ? (
            <p>No meeting requests yet.</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border rounded p-4">
                  <p className="font-semibold">{new Date(meeting.scheduled_date).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Supervisor: {meeting.supervisor_email || 'Unassigned'}</p>
                  <p className="text-sm text-gray-600">Status: {meeting.status}</p>
                  {meeting.notes && <p className="mt-2">{meeting.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
