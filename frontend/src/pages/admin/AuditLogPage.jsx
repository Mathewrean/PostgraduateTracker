import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { reportService } from '../../services'

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Use activity_log endpoint from reports (since audit endpoint restricted)
      const response = await reportService.activityLog('all')
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout title="Audit Logs">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="Audit Logs">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        {logs.length === 0 ? (
          <p>No audit log entries.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3">{log.user || 'System'}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
