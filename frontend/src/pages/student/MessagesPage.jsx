import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { complaintService } from '../../services'

export const MessagesPage = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await complaintService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setComplaints(data)
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      await complaintService.submit(content)
      setMessage({ type: 'success', text: 'Complaint submitted successfully' })
      setContent('')
      setShowForm(false)
      fetchComplaints()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Submission failed' })
    }
  }

  if (loading) return (
    <Layout title="Messages">
      <div className="flex justify-center items-center h-64">
        <p>Loading messages...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Messages">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Messages & Complaints</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : 'Submit Complaint'}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Describe your issue</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  className="w-full border rounded p-2"
                  placeholder="Please provide details..."
                />
              </div>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Submit Complaint
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Conversation History</h2>
          {complaints.length === 0 ? (
            <p className="text-gray-500">No complaints submitted.</p>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded shadow">
                <div className="border-b pb-3 mb-3">
                  <p className="text-sm text-gray-500">Submitted: {new Date(c.submitted_at).toLocaleString()}</p>
                  <p className="font-semibold mt-1">Status: <span className={`capitalize ${c.status === 'RESOLVED' ? 'text-green-600' : 'text-yellow-600'}`}>{c.status}</span></p>
                  <p className="mt-2">{c.content}</p>
                </div>
                {c.response_content && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm font-medium text-gray-600">Response from {c.responded_by_email || 'Administration'}:</p>
                    <p>{c.response_content}</p>
                    <p className="text-xs text-gray-500 mt-2">Responded at: {new Date(c.responded_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
