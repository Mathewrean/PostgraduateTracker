import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { documentService, minutesService, stageService } from '../../services'
import { useAuthStore } from '../../context/store'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx']

export const DocumentsPage = () => {
  const user = useAuthStore((state) => state.user)
  const [documents, setDocuments] = useState([])
  const [currentStage, setCurrentStage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [docType, setDocType] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const [stageResponse, response] = await Promise.all([
        stageService.getCurrentStage(),
        documentService.getAll()
      ])
      setCurrentStage(stageResponse.data)
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setDocuments(data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setMessage({ type: 'error', text: 'Only PDF, DOC, and DOCX files are allowed.' })
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE) {
      setMessage({ type: 'error', text: 'File size exceeds the 10MB limit.' })
      e.target.value = ''
      return
    }

    setMessage({ type: '', text: '' })
    setSelectedFile(file)
  }

  const handleDownload = async (doc) => {
    try {
      const response = await documentService.download(doc.id)
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
      )
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', doc.file_name || `${doc.doc_type}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      setMessage({ type: 'error', text: 'Download failed' })
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !currentStage?.id || !docType) {
      setMessage({ type: 'error', text: 'Please select a file and document type' })
      return
    }
    setUploading(true)
    setMessage({ type: '', text: '' })
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('stage', currentStage.id)
      if (docType === 'MINUTES') {
        await minutesService.upload(formData)
      } else {
        formData.append('doc_type', docType)
        await documentService.upload(formData)
      }
      setMessage({ type: 'success', text: 'Document uploaded successfully' })
      setSelectedFile(null)
      setDocType('')
      fetchDocuments()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <Layout title="Documents">
      <div className="flex justify-center items-center h-64">
        <p>Loading documents...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Documents">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Documents</h1>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          <p className="text-sm text-gray-500 mb-4">
            Current stage: {currentStage?.stage_type || user?.current_stage || 'Concept'}
          </p>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select type...</option>
                <option value="MINUTES">Minutes of Presentation</option>
                <option value="TRANSCRIPT">Academic Transcript</option>
                <option value="FEE_STATEMENT">Fee Statement</option>
                <option value="PROPOSAL">Proposal Document</option>
                <option value="THESIS">Thesis Document</option>
                <option value="INTENT_TO_SUBMIT">Intent to Submit</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File (PDF, DOC, DOCX; max 10MB)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold">Uploaded Documents</h2>
          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-medium">{doc.doc_type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.file_size ? (doc.file_size / 1024).toFixed(1) : 0} KB
                  </p>
                  {doc.is_verified && <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="text-blue-600 hover:underline"
                >
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
