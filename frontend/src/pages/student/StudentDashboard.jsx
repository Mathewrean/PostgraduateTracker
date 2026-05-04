import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Link } from 'react-router-dom'
import { ActivityCalendar } from '../../components/ActivityCalendar'
import { stageService, activityService, documentService, studentService } from '../../services'
import { useCurrentUser } from '../../hooks/useAuth'
import { useUIStore } from '../../context/store'

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const StudentDashboard = () => {
  const { user } = useCurrentUser()
  const isDark = useUIStore((state) => state.isDark)
  const [stage, setStage] = useState(null)
  const [activities, setActivities] = useState([])
  const [documents, setDocuments] = useState([])
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stageRes = await stageService.getCurrentStage()
        const profileRes = await studentService.getProfile()
        const currentStage = stageRes.data
        const [activitiesRes, docsRes] = await Promise.all([
          activityService.getAll(currentStage?.id ? { stage: currentStage.id } : {}),
          documentService.getAll(currentStage?.id ? { stage: currentStage.id } : {}),
        ])
        setStage(currentStage)
        setActivities(asList(activitiesRes.data))
        setDocuments(asList(docsRes.data))
        setStudentProfile(profileRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          {studentProfile?.project_title ? (
            <>
              <h1 className="text-3xl font-bold mb-2">{studentProfile.project_title}</h1>
              <p className="text-text-secondary">Student: {user?.first_name} {user?.last_name}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user?.first_name}</h1>
              <p className="text-text-secondary">Manage your postgraduate submissions and progress</p>
            </>
          )}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-text-secondary">Current Stage</p>
            <p className="text-2xl font-bold mt-2">{stage?.stage_type || 'CONCEPT'}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary">Documents Uploaded</p>
            <p className="text-2xl font-bold mt-2">{documents.length}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary">Activities</p>
            <p className="text-2xl font-bold mt-2">{activities.length}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/student/documents', label: 'Upload Documents' },
                { to: '/student/activities', label: 'Add Activity' },
                { to: '/student/activities', label: 'View Calendar' },
                { to: '/student/meetings', label: 'Schedule Meeting' },
                { to: '/student/messages', label: 'Submit Complaint' },
                { to: '#stage-progress', label: 'View Stage Progress', isAnchor: true },
              ].map(({ to, label, isAnchor }) =>
                isAnchor ? (
                  <a key={label} href={to} className="p-4 rounded-lg text-sm font-medium transition-colors duration-200 bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary">
                    {label}
                  </a>
                ) : (
                  <Link key={label} to={to} className="p-4 rounded-lg text-sm font-medium transition-colors duration-200 bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary">
                    {label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Activities Section */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-bg-primary border border-border-primary">
                  <p className="font-semibold text-sm text-text-primary">{activity.title}</p>
                  <p className="text-xs mt-1 text-text-secondary">{activity.description}</p>
                </div>
              ))}
              {activities.length === 0 && <p className="text-text-secondary">No activities yet</p>}
            </div>
          </div>

          {/* Documents Section */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Recent Documents</h3>
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-bg-primary border border-border-primary">
                  <p className="font-semibold text-sm text-text-primary">{doc.file_name || 'Document'}</p>
                  <p className="text-xs mt-1 text-text-secondary">{doc.doc_type}</p>
                </div>
              ))}
              {documents.length === 0 && <p className="text-text-secondary">No documents uploaded</p>}
            </div>
          </div>
        </div>

        {stage?.id && (
          <ActivityCalendar stageId={stage.id} isDark={isDark} />
        )}

        {/* Stage Progress Info */}
        {stage && (
          <div id="stage-progress" className="card">
            <h3 className="text-xl font-bold mb-4">Stage Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-text-secondary">Start Date</p>
                <p className="font-semibold">{stage.started_at ? new Date(stage.started_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-text-secondary">End Date</p>
                <p className="font-semibold">{stage.completed_at ? new Date(stage.completed_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Status</p>
                <p className="font-semibold">{stage.status || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
