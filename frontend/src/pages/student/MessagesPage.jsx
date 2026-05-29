import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { complaintService } from '../../services'

export const MessagesPage = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = async () => {
    try {
      const response = await complaintService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      // Sort by responded_at or updated_at or created_at (most recent first)
      const sorted = data.sort((a, b) => {
        const aTime = new Date(b.responded_at || b.updated_at || b.submitted_at || b.created_at)
        const bTime = new Date(a.responded_at || a.updated_at || a.submitted_at || a.created_at)
        return aTime - bTime
      })
      setComplaints(sorted)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch complaints' })
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
      <div className="flex justify-center items-center h-64"><p>Loading messages...</p></div>
    </Layout>
  )

  return (
    <Layout title="Messages">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Messages &amp; Complaints</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-danger">
            {showForm ? 'Cancel' : 'Submit Complaint'}
          </button>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-danger'}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="panel">
            <h2 className="text-xl font-semibold mb-4">New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Describe your issue</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  required rows={5} className="input-field"
                  placeholder="Please provide details..." />
              </div>
              <button type="submit" className="btn-danger">Submit Complaint</button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Conversation History</h2>
          {complaints.length === 0 ? (
            <p className="text-text-secondary">No complaints submitted.</p>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="panel">
                <div className="pb-3 mb-3 border-b border-border-primary">
                  <p className="text-sm text-text-secondary">
                    Submitted: {new Date(c.submitted_at).toLocaleString()}
                  </p>
                  <p className="font-semibold mt-1">
                    Status:{' '}
                    <span className={`capitalize ${c.status === 'RESOLVED' ? 'text-success' : 'text-warning'}`}>
                      {c.status}
                    </span>
                  </p>
                  <p className="mt-2">{c.content}</p>
                </div>
                {c.response_content && (
                  <div className="p-4 rounded-lg bg-bg-primary border border-border-primary">
                    <p className="text-sm font-medium text-text-secondary">Department Response:</p>
                    <p>{c.response_content}</p>
                    <p className="text-xs mt-2 text-text-secondary">
                      Responded at: {new Date(c.responded_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {Array.isArray(c.approval_trail) && c.approval_trail.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-lg font-semibold">Approval Trail</h3>
                    {c.approval_trail.map((entry, index) => (
                      <div key={`${c.id}-${index}`} className="border-l-2 border-border-strong pl-3">
                        <p className="font-semibold capitalize">{entry.action}</p>
                        <p className="text-sm text-text-secondary">
                          {entry.actor_role} - {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        {entry.signature && (
                          <p className="text-sm text-text-secondary">Signed: {entry.signature}</p>
                        )}
                      </div>
                    ))}
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
