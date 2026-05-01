import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Link } from 'react-router-dom'
import { ActivityCalendar } from '../../components/ActivityCalendar'
import { stageService, activityService, documentService, studentService } from '../../services'
import { useCurrentUser } from '../../hooks/useAuth'
import { useUIStore } from '../../context/store'

const asList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

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

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

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
              <p className={textColor}>Student: {user?.first_name} {user?.last_name}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user?.first_name}</h1>
              <p className={textColor}>Manage your postgraduate submissions and progress</p>
            </>
          )}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <p className={textColor}>Current Stage</p>
            <p className="text-2xl font-bold mt-2">{stage?.stage_type || 'CONCEPT'}</p>
          </div>
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <p className={textColor}>Documents Uploaded</p>
            <p className="text-2xl font-bold mt-2">{documents.length}</p>
          </div>
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <p className={textColor}>Activities</p>
            <p className="text-2xl font-bold mt-2">{activities.length}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/student/documents" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>Upload Documents</Link>
              <Link to="/student/activities" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>Add Activity</Link>
              <Link to="/student/activities" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>View Calendar</Link>
              <Link to="/student/meetings" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>Schedule Meeting</Link>
              <Link to="/student/messages" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>Submit Complaint</Link>
              <a href="#stage-progress" className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>View Stage Progress</a>
            </div>
          </div>

          {/* Activities Section */}
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, idx) => (
                <div key={idx} className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="font-semibold text-sm">{activity.title}</p>
                  <p className={`text-xs ${textColor} mt-1`}>{activity.description}</p>
                </div>
              ))}
              {activities.length === 0 && <p className={textColor}>No activities yet</p>}
            </div>
          </div>

          {/* Documents Section */}
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <h3 className="text-xl font-bold mb-4">Recent Documents</h3>
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc, idx) => (
                <div key={idx} className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="font-semibold text-sm">{doc.file_name || 'Document'}</p>
                  <p className={`text-xs ${textColor} mt-1`}>{doc.doc_type}</p>
                </div>
              ))}
              {documents.length === 0 && <p className={textColor}>No documents uploaded</p>}
            </div>
          </div>
        </div>

        {stage?.id && (
          <ActivityCalendar stageId={stage.id} isDark={isDark} />
        )}

        {/* Stage Progress Info */}
        {stage && (
          <div id="stage-progress" className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
            <h3 className="text-xl font-bold mb-4">Stage Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={textColor}>Start Date</p>
                <p className="font-semibold">{stage.started_at ? new Date(stage.started_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className={textColor}>End Date</p>
                <p className="font-semibold">{stage.completed_at ? new Date(stage.completed_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className={textColor}>Status</p>
                <p className="font-semibold">{stage.status || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
