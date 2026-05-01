import React, { useState } from 'react'
import { reportService } from '../../services'
import { Layout } from '../../components/Layout'

export const ReportsPage = ({ isDark = false }) => {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reportType, setReportType] = useState('students')
  const [error, setError] = useState('')

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  const handleGenerateReport = async () => {
    setLoading(true)
    setError('')
    
    try {
      let response
      switch (reportType) {
        case 'students':
          response = await reportService.getStudentProgress()
          break
        case 'supervisors':
          response = await reportService.getSupervisorReport()
          break
        case 'complaints':
          response = await reportService.getComplaintReport()
          break
        case 'users':
          response = await reportService.getUserReport()
          break
        case 'stage_transition':
          response = await reportService.getStageTransitionReport()
          break
        default:
          response = await reportService.getStudentProgress()
      }
      setReportData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const params = {}
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = dateTo
      params.format = format
      
      const response = await reportService.export(reportType, params)
      
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className={textColor}>Generate and export system reports</p>
        </div>

        {/* Report Type Selection */}
        <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
          <h3 className="text-xl font-bold mb-4">Report Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="students">Student Progress</option>
                <option value="users">User Activity</option>
                <option value="supervisors">Supervisor Activity</option>
                <option value="complaints">Complaint Statistics</option>
                <option value="stage_transition">Stage Transitions</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`py-2 px-4 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            {reportData && (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="py-2 px-4 rounded-md font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="py-2 px-4 rounded-md font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Export PDF
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report Results */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {reportData && (
          <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
            <h3 className="text-xl font-bold mb-4">Report Results</h3>
            <pre className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'} overflow-auto`}>
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  )
}
