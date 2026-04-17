import React, { useState } from 'react'
import { documentService } from '../services'

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const DOC_TYPE_OPTIONS = [
  { value: 'MINUTES', label: 'Minutes of Presentation' },
  { value: 'TRANSCRIPT', label: 'Academic Transcript' },
  { value: 'FEE_STATEMENT', label: 'Fee Statement Balance' },
  { value: 'PROPOSAL', label: 'Proposal Document' },
  { value: 'THESIS', label: 'Thesis Document' },
  { value: 'INTENT_TO_SUBMIT', label: 'Intent to Submit Form' },
  { value: 'OTHER', label: 'Other' },
]

export const DocumentUpload = ({ stageId, onSuccess, isDark = false }) => {
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  const validateFile = (file) => {
    if (!file) return 'Please select a file'
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, DOC, or DOCX files only.'
    }
    if (file.size > MAX_SIZE) {
      return 'File size too large. Maximum file size is 10MB.'
    }
    return null
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setError('')
    setSuccess('')
  }

  const handleUpload = async () => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!docType) {
      setError('Please select a document type')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('stage', stageId)
      formData.append('doc_type', docType)

      await documentService.upload(formData)
      setSuccess('Document uploaded successfully!')
      setFile(null)
      setDocType('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
      <h3 className="text-xl font-bold mb-4">Upload Document</h3>
      
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

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          />
          <p className={`text-xs ${textColor} mt-1`}>
            Accepted formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {/* Document Type */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Document Type
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value="">Select document type...</option>
            {DOC_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Info */}
        {file && (
          <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${textColor}`}>
              <strong>File:</strong> {file.name}
            </p>
            <p className={`text-sm ${textColor}`}>
              <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className={`text-sm ${textColor}`}>
              <strong>Type:</strong> {file.type || 'Unknown'}
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !docType || uploading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            !file || !docType || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  )
}