import React, { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { studentService, userService } from '../../services'

export const AssignSupervisorsPage = () => {
  const [students, setStudents] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, supervisorsRes] = await Promise.all([
        studentService.getAll(),
        userService.getAll({ role: 'supervisor' }),
      ])

      const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.results || []
      const supervisorList = Array.isArray(supervisorsRes.data) ? supervisorsRes.data : supervisorsRes.data.results || []

      setStudents(studentsList)
      setSupervisors(supervisorList)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load students or supervisors.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (studentId) => {
    const supervisorId = assignments[studentId]
    if (!supervisorId) {
      setMessage({ type: 'error', text: 'Select a supervisor before saving the assignment.' })
      return
    }

    try {
      await studentService.update(studentId, { assigned_supervisor: supervisorId })
      setMessage({ type: 'success', text: 'Supervisor assignment saved.' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Assignment failed.' })
    }
  }

  const handleChange = (studentId, supervisorId) => {
    setAssignments((current) => ({ ...current, [studentId]: supervisorId }))
  }

  if (loading) {
    return (
      <Layout title="Assign Supervisors">
        <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
      </Layout>
    )
  }

  return (
    <Layout title="Assign Supervisors">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Assign Supervisors</h1>
        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600 mb-4">Coordinator-assigned supervisors are the only supervisors who can approve stage transitions.</p>
          {students.length === 0 ? (
            <p>No students available for assignment.</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{student.user?.first_name} {student.user?.last_name}</p>
                    <p className="text-sm text-gray-500">{student.user?.email}</p>
                    <p className="text-sm text-gray-500">{student.project_title || 'No project title yet'}</p>
                    <p className="text-xs text-gray-500 mt-1">Current assignment: {student.assigned_supervisor_email || 'Unassigned'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={assignments[student.id] || student.assigned_supervisor || ''}
                      onChange={(e) => handleChange(student.id, e.target.value)}
                      className="border rounded p-2"
                    >
                      <option value="">Select supervisor...</option>
                      {supervisors.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.first_name || supervisor.last_name
                            ? `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim()
                            : supervisor.email}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(student.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
