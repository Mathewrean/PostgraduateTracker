import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Layout } from '../../components/Layout'
import { activityService, documentService, minutesService, stageService, studentService } from '../../services'

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const SupervisorStudentDetailPage = () => {
  const { studentId } = useParams()
  const [student, setStudent] = useState(null)
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    planned_date: '',
  })

  const fetchData = async () => {
    try {
      const [studentResponse, stagesResponse] = await Promise.all([
        studentService.getById(studentId),
        stageService.getAll({ student: studentId }),
      ])
      setStudent(studentResponse.data)
      setStages(asList(stagesResponse.data))
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load student details.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [studentId])

  const currentStage = useMemo(() => {
    return stages.find((stage) => ['ACTIVE', 'IN_PROGRESS'].includes(stage.status)) || stages[0] || null
  }, [stages])

  const blockers = useMemo(() => {
    if (!currentStage) return []
    const issues = []
    if (currentStage.status !== 'ACTIVE') {
      issues.push(currentStage.status === 'IN_PROGRESS'
        ? 'Thesis stage is still within the 90-day waiting period.'
        : `Stage status is ${currentStage.status}.`)
    }
    if (currentStage.missing_document_types?.length) {
      issues.push(`Missing documents: ${currentStage.missing_document_types.join(', ')}`)
    }
    if (currentStage.incomplete_activities?.length) {
      issues.push(`Incomplete activities: ${currentStage.incomplete_activities.join(', ')}`)
    }
    if (currentStage.minutes_approved === false) {
      issues.push('Minutes must be approved before stage approval.')
    }
    return issues
  }, [currentStage])

  const triggerDownload = (blob, fileName) => {
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  }

  const handleDocumentDownload = async (doc) => {
    const response = await documentService.download(doc.id)
    triggerDownload(
      new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' }),
      doc.file_name || `${doc.doc_type}.pdf`,
    )
  }

  const handleMinutesDownload = async (minutes) => {
    const response = await minutesService.download(minutes.id)
    triggerDownload(
      new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' }),
      minutes.file_name || 'minutes.pdf',
    )
  }

  const handleMinutesApprove = async () => {
    try {
      await minutesService.approve(currentStage.minutes.id)
      setMessage({ type: 'success', text: 'Minutes approved successfully.' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Minutes approval failed.' })
    }
  }

  const handleStageApprove = async () => {
    try {
      await stageService.approve(currentStage.id)
      setMessage({ type: 'success', text: 'Stage approved successfully.' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Stage approval failed.' })
    }
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()
    try {
      await activityService.create({ ...activityForm, stage: currentStage.id })
      setActivityForm({ title: '', description: '', planned_date: '' })
      setMessage({ type: 'success', text: 'Activity added successfully.' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add activity.' })
    }
  }

  if (loading) {
    return (
      <Layout title="Student Detail">
        <div className="flex justify-center items-center h-64"><p>Loading student details...</p></div>
      </Layout>
    )
  }

  return (
    <Layout title="Student Detail">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{student?.project_title || 'Student Project'}</h1>
          <p className="text-gray-600">
            {student?.user?.first_name} {student?.user?.last_name} • Current stage: {student?.current_stage}
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {currentStage && (
          <div className="bg-white p-6 rounded shadow space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Current Stage</h2>
              <p className="text-gray-600">{currentStage.stage_type} • {currentStage.status}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Documents</h3>
              <div className="space-y-3">
                {currentStage.documents?.map((doc) => (
                  <div key={doc.id} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.doc_type}</p>
                      <p className="text-sm text-gray-500">{doc.file_name}</p>
                    </div>
                    <button onClick={() => handleDocumentDownload(doc)} className="text-blue-600 hover:underline">
                      Download
                    </button>
                  </div>
                ))}
                {currentStage.minutes && (
                  <div className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Minutes of Presentation</p>
                      <p className="text-sm text-gray-500">{currentStage.minutes.file_name}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleMinutesDownload(currentStage.minutes)} className="text-blue-600 hover:underline">
                        Download
                      </button>
                      {!currentStage.minutes.is_approved && (
                        <button onClick={handleMinutesApprove} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
                          Approve Minutes
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Activities</h3>
              <div className="space-y-3 mb-4">
                {currentStage.activities?.map((activity) => (
                  <div key={activity.id} className="border rounded p-3">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.planned_date).toLocaleString()} • {activity.status}
                    </p>
                    {activity.created_by_email && (
                      <p className="text-xs text-gray-500">
                        Assigned by: {activity.created_by_email}
                      </p>
                    )}
                  </div>
                ))}
                {!currentStage.activities?.length && <p>No activities recorded yet.</p>}
              </div>

              <form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Activity title"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="border rounded p-2"
                  required
                />
                <input
                  type="datetime-local"
                  value={activityForm.planned_date}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, planned_date: e.target.value }))}
                  className="border rounded p-2"
                  required
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                  Add Activity
                </button>
                <textarea
                  placeholder="Activity description"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="border rounded p-2 md:col-span-3"
                  rows={3}
                />
              </form>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Stage Approval</h3>
              {blockers.length > 0 && (
                <div className="mb-4 rounded bg-amber-50 border border-amber-200 p-4 text-amber-800">
                  {blockers.map((blocker) => (
                    <p key={blocker}>{blocker}</p>
                  ))}
                </div>
              )}
              <button
                onClick={handleStageApprove}
                disabled={blockers.length > 0}
                className={`px-4 py-2 rounded text-white ${blockers.length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Approve Stage
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
