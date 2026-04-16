import React, { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { reportService } from '../../services'
import { useUIStore, useAuthStore } from '../../context/store'

export const CoordinatorDashboard = () => {
  const isDark = useUIStore((state) => state.isDark)
  const user = useAuthStore((state) => state.user)
  const [reports, setReports] = useState({})
  const [loading, setLoading] = useState(true)

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [progress, supervisor, complaints, transitions] = await Promise.all([
          reportService.getStudentProgress(),
          reportService.getSupervisorReport(),
          reportService.getComplaintReport(),
          reportService.getStageTransitionReport()
        ])
        
        setReports({
          progress: progress.data,
          supervisor: supervisor.data,
          complaints: complaints.data,
          transitions: transitions.data
        })
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) return (
    <Layout title="Coordinator Dashboard" user={user}>
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Coordinator Dashboard" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coordinator Dashboard</h1>
          <p className={textColor}>Overview of all postgraduate submissions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: reports.progress?.total_students || 0, valueClass: 'text-blue-600' },
            { label: 'Concept Stage', value: reports.progress?.stages?.CONCEPT || 0, valueClass: 'text-yellow-600' },
            { label: 'Proposal Stage', value: reports.progress?.stages?.PROPOSAL || 0, valueClass: 'text-orange-600' },
            { label: 'Completed', value: reports.progress?.stages?.COMPLETED || 0, valueClass: 'text-green-600' },
          ].map((stat, idx) => (
            <div key={idx} className={`${cardBg} p-6 rounded-lg border ${borderColor}`}>
              <p className={textColor}>{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.valueClass}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Complaint Statistics */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Complaint Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold">{reports.complaints?.total}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Submitted</p>
              <p className="text-2xl font-bold text-blue-600">{reports.complaints?.submitted}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{reports.complaints?.under_review}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{reports.complaints?.resolved}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{reports.complaints?.overdue}</p>
            </div>
          </div>
        </div>

        {/* Stage Transitions */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Stage Transitions</h3>
          <div className="space-y-3">
            <p>Concept → Proposal: <span className="font-bold">{reports.transitions?.concept_to_proposal}</span></p>
            <p>Proposal → Thesis: <span className="font-bold">{reports.transitions?.proposal_to_thesis}</span></p>
            <p>Thesis Completed: <span className="font-bold">{reports.transitions?.thesis_completion}</span></p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
