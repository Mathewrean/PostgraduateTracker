import React, { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { activityService, reportService } from '../../services'
import { useUIStore, useAuthStore } from '../../context/store'

export const CoordinatorDashboard = () => {
  const isDark = useUIStore((state) => state.isDark)
  const user = useAuthStore((state) => state.user)
  const [reports, setReports] = useState({})
  const [activities, setActivities] = useState([])
  const [activityFilters, setActivityFilters] = useState({
    student: '',
    supervisor: '',
    stage: '',
    status: '',
    from: '',
    to: ''
  })
  const [expandedActivityId, setExpandedActivityId] = useState(null)
  const [loading, setLoading] = useState(true)

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [progress, supervisor, complaints, transitions, activityList] = await Promise.all([
          reportService.getStudentProgress(),
          reportService.getSupervisorReport(),
          reportService.getComplaintReport(),
          reportService.getStageTransitionReport(),
          activityService.getAll()
        ])
        
        setReports({
          progress: progress.data,
          supervisor: supervisor.data,
          complaints: complaints.data,
          transitions: transitions.data
        })
        setActivities(activityList.data?.results || activityList.data || [])
      } catch {
        setReports({})
        setActivities([])
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

  const filteredActivities = activities.filter((activity) => {
    const student = (activity.student_name || activity.student_email || '').toLowerCase()
    const supervisor = (activity.supervisor_name || activity.supervisor_email || '').toLowerCase()
    const stage = (activity.stage_type || '').toLowerCase()
    const status = (activity.status || '').toLowerCase()
    const plannedDate = activity.planned_date ? activity.planned_date.slice(0, 10) : ''

    if (activityFilters.student && !student.includes(activityFilters.student.toLowerCase())) return false
    if (activityFilters.supervisor && !supervisor.includes(activityFilters.supervisor.toLowerCase())) return false
    if (activityFilters.stage && stage !== activityFilters.stage.toLowerCase()) return false
    if (activityFilters.status && status !== activityFilters.status.toLowerCase()) return false
    if (activityFilters.from && plannedDate < activityFilters.from) return false
    if (activityFilters.to && plannedDate > activityFilters.to) return false
    return true
  })

  const updateActivityFilter = (name, value) => {
    setActivityFilters((prev) => ({ ...prev, [name]: value }))
  }

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
            {
              label: 'Total Students',
              value: Object.values(reports.progress?.current_stage_students || {}).reduce((sum, items) => sum + items.length, 0),
              valueClass: 'text-blue-600'
            },
            { label: 'Concept Stage', value: reports.progress?.current_stage_students?.CONCEPT?.length || 0, valueClass: 'text-yellow-600' },
            { label: 'Proposal Stage', value: reports.progress?.current_stage_students?.PROPOSAL?.length || 0, valueClass: 'text-orange-600' },
            { label: 'Completed', value: reports.progress?.current_stage_students?.COMPLETED?.length || 0, valueClass: 'text-green-600' },
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
              <p className="text-2xl font-bold">{reports.complaints?.summary?.total}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Submitted</p>
              <p className="text-2xl font-bold text-blue-600">{reports.complaints?.summary?.submitted}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{reports.complaints?.summary?.under_review}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{reports.complaints?.summary?.resolved}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{reports.complaints?.summary?.overdue}</p>
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

        <section className="card">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Student-Supervisor Activities</h3>
              <p className={textColor}>All planned and completed research workflow activities</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>{filteredActivities.length} shown</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <input
              type="search"
              value={activityFilters.student}
              onChange={(event) => updateActivityFilter('student', event.target.value)}
              className="input-field"
              placeholder="Student name"
            />
            <input
              type="search"
              value={activityFilters.supervisor}
              onChange={(event) => updateActivityFilter('supervisor', event.target.value)}
              className="input-field"
              placeholder="Supervisor name"
            />
            <select
              value={activityFilters.stage}
              onChange={(event) => updateActivityFilter('stage', event.target.value)}
              className="input-field"
            >
              <option value="">All stages</option>
              <option value="CONCEPT">Concept</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="THESIS">Thesis</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={activityFilters.status}
              onChange={(event) => updateActivityFilter('status', event.target.value)}
              className="input-field"
            >
              <option value="">All statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              type="date"
              value={activityFilters.from}
              onChange={(event) => updateActivityFilter('from', event.target.value)}
              className="input-field"
            />
            <input
              type="date"
              value={activityFilters.to}
              onChange={(event) => updateActivityFilter('to', event.target.value)}
              className="input-field"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Supervisor</th>
                  <th className="py-3 pr-4">Stage</th>
                  <th className="py-3 pr-4">Activity</th>
                  <th className="py-3 pr-4">Planned Date</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => {
                  const isExpanded = expandedActivityId === activity.id
                  return (
                    <React.Fragment key={activity.id}>
                      <tr
                        onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                        className="cursor-pointer"
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                      >
                        <td className="py-3 pr-4">{activity.student_name || activity.student_email || 'Unassigned'}</td>
                        <td className="py-3 pr-4">{activity.supervisor_name || activity.supervisor_email || 'Unassigned'}</td>
                        <td className="py-3 pr-4">{activity.stage_type}</td>
                        <td className="py-3 pr-4 font-medium">{activity.title}</td>
                        <td className="py-3 pr-4">{activity.planned_date ? new Date(activity.planned_date).toLocaleDateString() : '-'}</td>
                        <td className="py-3 pr-4">{activity.status === 'COMPLETED' ? 'Completed' : 'Planned'}</td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td colSpan="6" className="py-3 pr-4">
                            <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                              <p>{activity.description || 'No description provided.'}</p>
                              <p>{activity.notes || 'No notes recorded.'}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                      No activities match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  )
}
