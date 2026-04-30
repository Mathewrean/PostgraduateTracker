import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { supervisorService } from '../../services'

export const MyStudentsPage = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await supervisorService.getStudents()
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout title="My Students">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

  return (
    <Layout title="My Students">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Students</h1>
        {students.length === 0 ? (
          <p>No students assigned.</p>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <div key={student.id} className="bg-white p-6 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Name</p>
                    <p className="font-semibold">{student.user?.first_name} {student.user?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p>{student.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Project</p>
                    <p>{student.project_title || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Current Stage</p>
                    <p className="capitalize font-semibold">{student.current_stage?.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
