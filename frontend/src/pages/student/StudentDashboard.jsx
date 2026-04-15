import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { stageService, activityService, documentService } from '../../services'
import { useCurrentUser } from '../../hooks/useAuth'
import Calendar from '../../components/Calendar'

export const StudentDashboard = () => {
  const { user } = useCurrentUser()
  const [stage, setStage] = useState(null)
  const [activities, setActivities] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div>Loading...</div>

  return (
    <Layout>
      <div className="space-y-8">
        {/* Stage Indicator */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Stage</h2>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-gray-600">Stage</p>
              <p className="text-3xl font-bold text-blue-600">{stage?.stage_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="text-xl font-semibold text-green-600">{stage?.status}</p>
            </div>
          </div>
        </div>

        {/* Calendar & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Calendar activities={activities} />
          </div>
          
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Activities</h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.planned_date}</p>
                  <span className={`text-xs font-semibold ${activity.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg">
                <p className="font-medium text-gray-800">{doc.doc_type}</p>
                <p className="text-sm text-gray-600">Uploaded: {doc.uploaded_at}</p>
                <p className="text-sm text-gray-600">Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
