import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { reportService } from '../../services'

export const UserActivityPage = () => {
  const [logData, setLogData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoginHistory()
  }, [])

  const fetchLoginHistory = async () => {
    try {
      const response = await reportService.loginHistory()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setLogData(data)
    } catch (error) {
      console.error('Failed to fetch login history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout title="User Activity">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="User Activity">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">User Login History</h1>
        {logData.length === 0 ? (
          <p>No login records found.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">IP Address</th>
                  <th className="p-3 text-left">Login Time</th>
                </tr>
              </thead>
              <tbody>
                {logData.map((entry, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3">{entry.user}</td>
                    <td className="p-3">{entry.ip_address || 'N/A'}</td>
                    <td className="p-3">{new Date(entry.timestamp).toLocaleString()}</td>
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
