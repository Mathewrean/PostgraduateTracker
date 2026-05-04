import React, { useState } from 'react'
import { complaintService } from '../services'
import { useUIStore } from '../context/store'

export const ComplaintForm = ({ onSuccess }) => {
  const isDark = useUIStore((s) => s.isDark)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const containerStyle = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  }

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
    <div className="p-6 rounded-lg" style={containerStyle}>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Submit a Complaint</h3>
      
      {error && (
        <div className="mb-4 p-3 rounded alert-danger">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 rounded alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2`} style={{ color: 'var(--text-secondary)' }}>
            Complaint Details
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md`}
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            placeholder="Please describe your complaint in detail..."
          />
          <p className={`text-xs mt-1`} style={{ color: 'var(--text-secondary)' }}>
            Your complaint will be reviewed by the appropriate authorities. You will receive a response within 14 days.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors`}
          style={submitting ? { backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' } : { backgroundColor: 'var(--color-brand)', color: 'var(--bg-main)' }}
        >
          {submitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}