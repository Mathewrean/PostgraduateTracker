import React, { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { reportService } from '../../services'

export const CoordinatorDashboard = () => {
  const [reports, setReports] = useState({})
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div>Loading...</div>

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Coordinator Dashboard</h1>

        {/* Student Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">{reports.progress?.total_students}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Concept Stage</p>
            <p className="text-3xl font-bold text-yellow-600">{reports.progress?.stages?.CONCEPT}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Proposal Stage</p>
            <p className="text-3xl font-bold text-orange-600">{reports.progress?.stages?.PROPOSAL}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">{reports.progress?.stages?.COMPLETED}</p>
          </div>
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
