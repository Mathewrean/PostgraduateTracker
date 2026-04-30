import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { stageService } from '../../services'

export const PendingApprovalsPage = () => {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const response = await stageService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      // Filter for ACTIVE stages only
      setStages(data.filter(s => s.status === 'ACTIVE'))
    } catch (error) {
      console.error('Failed to fetch stages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (stageId) => {
    try {
      await stageService.approve(stageId)
      setMessage({ type: 'success', text: 'Stage approved successfully' })
      fetchApprovals()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Approval failed' })
    }
  }

  if (loading) return (
    <Layout title="Pending Approvals">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="Pending Approvals">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        {stages.length === 0 ? (
          <p>No pending approvals.</p>
        ) : (
          <div className="grid gap-4">
            {stages.map((stage) => (
              <div key={stage.id} className="bg-white p-6 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Student</p>
                    <p className="font-semibold">{stage.student_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Stage Type</p>
                    <p className="capitalize">{stage.stage_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Started</p>
                    <p>{stage.started_at ? new Date(stage.started_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">{stage.status}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleApprove(stage.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Approve Stage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
