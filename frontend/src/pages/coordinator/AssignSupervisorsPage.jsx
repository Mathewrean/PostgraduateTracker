import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { studentService } from '../../services'
import { supervisorService } from '../../services'

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
        supervisorService.getStudents()
      ])
      const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.results || []
      const supervisorsList = Array.isArray(supervisorsRes.data) ? supervisorsRes.data : supervisorsRes.data.results || []
      setStudents(studentsList)
      setSupervisors(supervisorsList)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (studentId) => {
    const supervisorId = assignments[studentId]
    if (!supervisorId) {
      setMessage({ type: 'error', text: 'Select a supervisor first' })
      return
    }
    try {
      await studentService.update(studentId, { assigned_supervisor: supervisorId })
      setMessage({ type: 'success', text: 'Supervisor assigned' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Assignment failed' })
    }
  }
    try {
      // Call update endpoint on student
      await studentService.update({ assigned_supervisor: supervisorId })
      setMessage({ type: 'success', text: 'Supervisor assigned' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Assignment failed' })
    }
  }

  const handleChange = (studentId, supervisorId) => {
    setAssignments({ ...assignments, [studentId]: supervisorId })
  }

  if (loading) return (
    <Layout title="Assign Supervisors">
      <div className="flex justify-center items-center h-64"><p>Loading...</p></div>
    </Layout>
  )

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
          <p className="text-gray-600 mb-4">Assign supervisors to students. Students without a supervisor will appear here.</p>
          {students.length === 0 ? (
            <p>No students.</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{student.user?.first_name} {student.user?.last_name}</p>
                    <p className="text-sm text-gray-500">{student.project_title || 'No project'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={assignments[student.id] || ''}
                      onChange={(e) => handleChange(student.id, e.target.value)}
                      className="border rounded p-2"
                    >
                      <option value="">Assign supervisor...</option>
                      {supervisors.map((sup) => (
                        <option key={sup.id} value={sup.id}>{sup.user?.email}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(student.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                    >
                      Assign
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
