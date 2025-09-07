import React, { useState, useEffect } from 'react'
import { User, Settings, Save, Edit2, Mail, Building, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const ProfilePage = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    datasetsUploaded: 0,
    analysesRun: 0,
    visualizations: 0,
    daysActive: 0
  })
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    institution: user?.institution || '',
    researchArea: user?.researchArea || ''
  })

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true)
        const response = await api.get('/auth/stats')
        if (response.data.success) {
          setUserStats(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch user statistics:', error)
        // Keep default values if API call fails
      } finally {
        setStatsLoading(false)
      }
    }

    if (user) {
      fetchUserStats()
    }
  }, [user])

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        researchArea: user.researchArea || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/auth/profile', formData)
      setUser(response.data.data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      institution: user?.institution || '',
      researchArea: user?.researchArea || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="card text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{user?.name}</h3>
          <p className="text-gray-600 mb-2">{user?.email}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 capitalize">
            {user?.role}
          </span>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2" />
              {user?.institution || 'No institution specified'}
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <BookOpen className="w-4 h-4 mr-2" />
              {user?.researchArea || 'No research area specified'}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <p className="py-2 px-3 bg-gray-50 rounded-lg text-gray-900">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded-lg text-gray-600">
                  {user?.email}
                  <span className="block text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Institution
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your university or research institution"
                  />
                ) : (
                  <p className="py-2 px-3 bg-gray-50 rounded-lg text-gray-900">
                    {user?.institution || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Research Area
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="researchArea"
                    value={formData.researchArea}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Genomics, Proteomics, Bioinformatics"
                  />
                ) : (
                  <p className="py-2 px-3 bg-gray-50 rounded-lg text-gray-900">
                    {user?.researchArea || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded-lg text-gray-600 capitalize">
                  {user?.role}
                  <span className="block text-xs text-gray-500 mt-1">
                    Role is managed by administrators
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <p className="py-2 px-3 bg-gray-50 rounded-lg text-gray-900">
                  {user?.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString() + ' at ' + 
                      new Date(user.lastLogin).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Account Statistics - Updated with real data */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {statsLoading ? (
                <div className="spinner mx-auto"></div>
              ) : (
                userStats.datasetsUploaded
              )}
            </div>
            <div className="text-sm text-gray-600">Datasets Uploaded</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {statsLoading ? (
                <div className="spinner mx-auto"></div>
              ) : (
                userStats.analysesRun
              )}
            </div>
            <div className="text-sm text-gray-600">Analyses Run</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statsLoading ? (
                <div className="spinner mx-auto"></div>
              ) : (
                userStats.visualizations
              )}
            </div>
            <div className="text-sm text-gray-600">Visualizations</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {statsLoading ? (
                <div className="spinner mx-auto"></div>
              ) : (
                userStats.daysActive
              )}
            </div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Account Status</h4>
              <p className="text-sm text-gray-600">Your account is active and verified</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
