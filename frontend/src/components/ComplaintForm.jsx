import React, { useState } from 'react'
import { complaintService } from '../services'

export const ComplaintForm = ({ onSuccess, isDark = false }) => {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Please provide details for your complaint')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await complaintService.submit(content)
      setSuccess('Your complaint has been submitted successfully. You will receive a response via email.')
      setContent('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
      <h3 className="text-xl font-bold mb-4">Submit a Complaint</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Complaint Details
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            placeholder="Please describe your complaint in detail..."
          />
          <p className={`text-xs ${textColor} mt-1`}>
            Your complaint will be reviewed by the appropriate authorities. You will receive a response within 14 days.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            submitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}