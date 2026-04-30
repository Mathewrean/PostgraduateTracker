import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { complaintService } from '../../services'

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState({})
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
      console.error('Failed to fetch complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (complaintId) => {
    const text = responseText[complaintId]
    if (!text) return
    try {
      await complaintService.respond(complaintId, text)
      setMessage({ type: 'success', text: 'Response sent' })
      setResponded({ ...responded, [complaintId]: true })
      setResponseText({ ...responseText, [complaintId]: '' })
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
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        {complaints.length === 0 ? (
          <p>No complaints submitted.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded shadow">
                <div className="border-b pb-3 mb-3">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">From: {c.student_email || c.student?.user?.email}</p>
                    <p className="text-sm text-gray-500">{new Date(c.submitted_at).toLocaleString()}</p>
                  </div>
                  <p className="font-semibold mt-2">
                    Status: <span className={`capitalize ${c.status === 'RESOLVED' ? 'text-green-600' : 'text-yellow-600'}`}>{c.status}</span>
                    {c.is_overdue && <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Overdue</span>}
                  </p>
                  <p className="mt-3">{c.content}</p>
                </div>
                {c.response_content ? (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm font-medium text-gray-600">Response ({new Date(c.responded_at).toLocaleString()}):</p>
                    <p>{c.response_content}</p>
                  </div>
                ) : (
                  !responded[c.id] && (
                    <div className="mt-4">
                      <textarea
                        value={responseText[c.id] || ''}
                        onChange={(e) => setResponseText({ ...responseText, [c.id]: e.target.value })}
                        placeholder="Write your response..."
                        className="w-full border rounded p-2 mb-2"
                        rows={3}
                      />
                      <button
                        onClick={() => handleRespond(c.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Send Response
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
