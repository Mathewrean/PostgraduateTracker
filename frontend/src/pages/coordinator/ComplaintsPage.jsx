import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { complaintService } from '../../services'

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState({})
  const [signatureText, setSignatureText] = useState({})
  const [responded, setResponded] = useState({})
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
      setMessage({ type: 'error', text: 'Failed to fetch complaints' })
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (complaintId) => {
    const text = responseText[complaintId]
    const signature = signatureText[complaintId]
    if (!text || !signature) {
      setMessage({ type: 'error', text: 'Response and e-signature are required' })
      return
    }
    try {
      await complaintService.respond(complaintId, text, signature)
      setMessage({ type: 'success', text: 'Response sent' })
      setResponded({ ...responded, [complaintId]: true })
      setResponseText({ ...responseText, [complaintId]: '' })
      setSignatureText({ ...signatureText, [complaintId]: '' })
      fetchComplaints()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send response' })
    }
  }

  if (loading) return (
    <Layout title="Complaints">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="Complaints Management">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Complaints</h1>
        {message.text && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-danger'}>
            {message.text}
          </div>
        )}
        {complaints.length === 0 ? (
          <p>No complaints submitted.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="panel">
                <div className="border-b border-border-primary pb-3 mb-3">
                  <div className="flex justify-between">
                    <p className="text-sm text-text-secondary">From: {c.student_email || c.student?.user?.email}</p>
                    <p className="text-sm text-text-secondary">{new Date(c.submitted_at).toLocaleString()}</p>
                  </div>
                  <p className="font-semibold mt-2">
                    Status: <span className={`capitalize ${c.status === 'RESOLVED' ? 'text-success' : 'text-warning'}`}>{c.status}</span>
                    {c.is_overdue && <span className="ml-2 badge-danger">Overdue</span>}
                  </p>
                  <p className="mt-3">{c.content}</p>
                </div>
                {c.response_content ? (
                  <div className="panel">
                    <p className="text-sm font-medium text-text-secondary">Response ({new Date(c.responded_at).toLocaleString()}):</p>
                    <p>{c.response_content}</p>
                  </div>
                ) : (
                  !responded[c.id] && (
                    <div className="mt-4">
                      <textarea
                        value={responseText[c.id] || ''}
                        onChange={(e) => setResponseText({ ...responseText, [c.id]: e.target.value })}
                        placeholder="Write your response..."
                        className="input-field mb-2"
                        rows={3}
                      />
                      <input
                        value={signatureText[c.id] || ''}
                        onChange={(e) => setSignatureText({ ...signatureText, [c.id]: e.target.value })}
                        placeholder="Type your e-signature"
                        className="input-field mb-2"
                      />
                      <button
                        onClick={() => handleRespond(c.id)}
                        className="btn-primary"
                      >
                        Send Response
                      </button>
                    </div>
                  )
                )}
                {Array.isArray(c.approval_trail) && c.approval_trail.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h2 className="text-lg font-semibold">Approval Trail</h2>
                    {c.approval_trail.map((entry, index) => (
                      <div key={`${c.id}-${index}`} className="border-l-2 border-border-strong pl-3">
                        <p className="font-semibold capitalize">{entry.action}</p>
                        <p className="text-sm text-text-secondary">
                          {entry.actor_role} - {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
