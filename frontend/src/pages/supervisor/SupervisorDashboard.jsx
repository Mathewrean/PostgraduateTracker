import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { supervisorService } from '../../services'
import { useAuthStore } from '../../context/store'

export const SupervisorDashboard = () => {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({ total: 0, pending: 0 })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, approvalsRes] = await Promise.all([
        supervisorService.getStudents(),
        supervisorService.getApprovals()
      ])
      const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.results || []
      const approvals = Array.isArray(approvalsRes.data) ? approvalsRes.data : approvalsRes.data.results || []
      setStudents(studentsList)
      setStats({
        total: studentsList.length,
        pending: approvals.length
      })
    } catch (error) {
      console.error('Failed to fetch supervisor data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout title="Supervisor Dashboard">
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Supervisor Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.first_name} {user?.last_name}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Assigned Students</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Pending Reviews</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Completed Stages</p>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/supervisor/students" className="block bg-blue-50 hover:bg-blue-100 p-3 rounded">View My Students</a>
              <a href="/supervisor/approvals" className="block bg-yellow-50 hover:bg-yellow-100 p-3 rounded">Pending Approvals</a>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>

        {/* Assigned Students */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Students</h2>
          {students.length === 0 ? (
            <p>No students assigned to you yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-3">{s.user?.first_name} {s.user?.last_name}</td>
                      <td className="p-3">{s.user?.email}</td>
                      <td className="p-3">{s.project_title || 'Not set'}</td>
                      <td className="p-3">{s.current_stage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
