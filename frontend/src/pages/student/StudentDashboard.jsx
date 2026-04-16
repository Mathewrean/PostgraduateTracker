import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { stageService, activityService, documentService } from '../../services'
import { useCurrentUser } from '../../hooks/useAuth'
import { useUIStore } from '../../context/store'

export const StudentDashboard = () => {
  const { user } = useCurrentUser()
  const isDark = useUIStore((state) => state.isDark)
  const [stage, setStage] = useState(null)
  const [activities, setActivities] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stageRes, activitiesRes, docsRes] = await Promise.all([
          stageService.getCurrentStage(),
          activityService.getAll(),
          documentService.getAll()
        ])
        
        setStage(stageRes.data)
        setActivities(activitiesRes.data)
        setDocuments(docsRes.data)
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
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.first_name}</h1>
          <p className={textColor}>Manage your postgraduate submissions and progress</p>
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

        {/* Stage Progress Info */}
        {stage && (
          <div className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
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
