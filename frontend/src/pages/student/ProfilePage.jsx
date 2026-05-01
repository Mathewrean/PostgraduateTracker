import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { authService, studentService } from '../../services'
import { useAuthStore } from '../../context/store'

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const [profile, setProfile] = useState({
    project_title: '',
    preferred_supervisor: '',
    preferred_supervisor_other: '',
    email: user?.email || '',
    phone: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await studentService.getProfile()
      setProfile(prev => ({
        ...prev,
        project_title: response.data.project_title || '',
        preferred_supervisor: response.data.preferred_supervisor || '',
        preferred_supervisor_other: response.data.preferred_supervisor_other || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      await authService.updateProfile({
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        project_title: profile.project_title,
        preferred_supervisor: profile.preferred_supervisor,
        preferred_supervisor_other: profile.preferred_supervisor_other,
        phone: profile.phone
      })
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Update failed' })
    }
  }

  if (loading) return (
    <Layout title="Profile">
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    </Layout>
  )

  return (
    <Layout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          {user?.profile_complete === false && (
            <p className="text-sm text-amber-700 mt-2">
              Complete your project title and supervisor preference before using the student dashboard.
            </p>
          )}
        </div>

        {message.text && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white p-6 rounded shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <input
                type="text"
                name="project_title"
                value={profile.project_title}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Supervisor</label>
              <select
                name="preferred_supervisor"
                value={profile.preferred_supervisor}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="">Select a supervisor</option>
                <option value="Professor Okello (Dean)">Professor Okello (Dean)</option>
                <option value="Dr. Prisca Magotu (COD)">Dr. Prisca Magotu (COD)</option>
                <option value="Prof. Miner Titus">Prof. Miner Titus</option>
                <option value="Dr. Joseph Nyakinda">Dr. Joseph Nyakinda</option>
                <option value="Dr. Willy Kangojo (Coordinator)">Dr. Willy Kangojo (Coordinator)</option>
                <option value="Dr. Julius Owino">Dr. Julius Owino</option>
                <option value="Dr. Francis Akwenda Odhiambo">Dr. Francis Akwenda Odhiambo</option>
                <option value="Director BPS">Director BPS</option>
                <option value="OTHER">Other</option>
              </select>
              {profile.preferred_supervisor === 'OTHER' && (
                <input
                  type="text"
                  name="preferred_supervisor_other"
                  value={profile.preferred_supervisor_other}
                  onChange={handleChange}
                  placeholder="Specify preferred supervisor"
                  className="w-full border rounded p-2 mt-2"
                />
              )}
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
