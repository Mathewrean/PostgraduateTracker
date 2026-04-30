import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { studentService } from '../../services'

export const AllStudentsPage = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout title="All Students">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="All Students">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">All Students</h1>
        {students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left">Stage</th>
                  <th className="p-3 text-left">Supervisor</th>
                  <th className="p-3 text-left">Profile</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.user?.email}</td>
                    <td className="p-3">{s.user?.first_name} {s.user?.last_name}</td>
                    <td className="p-3">{s.project_title || '-'}</td>
                    <td className="p-3 capitalize">{s.current_stage?.toLowerCase()}</td>
                    <td className="p-3">{s.assigned_supervisor_email || 'Unassigned'}</td>
                    <td className="p-3">
                      {s.profile_complete ? (
                        <span className="text-green-600">Complete</span>
                      ) : (
                        <span className="text-yellow-600">Incomplete</span>
                      )}
                    </td>
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
