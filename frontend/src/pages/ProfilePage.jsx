import React, { useState, useEffect } from 'react'
import { User, Settings, Save, Edit2, Mail, Building, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { motion } from 'framer-motion'

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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.4 }}
      className="w-full max-w-[1400px] mx-auto pb-10 space-y-6 lg:space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Profile Overview */}
        <div className="glass-card text-center p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 h-fit">
          <div className="w-24 h-24 bg-primary-50 text-primary-700 border border-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{user?.name}</h3>
          <p className="text-slate-600 mb-2">{user?.email}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-600 border border-primary-200 capitalize shadow-[0_0_10px_rgba(99,102,241,0.1)]">
            {user?.role}
          </span>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center text-sm text-slate-700">
              <Building className="w-4 h-4 mr-2 text-slate-600" />
              {user?.institution || 'No institution specified'}
            </div>
            <div className="flex items-center justify-center text-sm text-slate-700">
              <BookOpen className="w-4 h-4 mr-2 text-slate-600" />
              {user?.researchArea || 'No research area specified'}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-1 text-slate-600" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="glass-input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <p className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-800">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1 text-slate-600" />
                  Email Address
                </label>
                <div className="py-2.5 px-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-600">{user?.email}</p>
                  <span className="block text-xs text-slate-500 mt-1">
                    Email cannot be changed
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1 text-slate-600" />
                  Institution
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="glass-input w-full"
                    placeholder="Your university or research institution"
                  />
                ) : (
                  <p className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-800">
                    {user?.institution || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1 text-slate-600" />
                  Research Area
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="researchArea"
                    value={formData.researchArea}
                    onChange={handleInputChange}
                    className="glass-input w-full"
                    placeholder="e.g., Genomics, Proteomics, Bioinformatics"
                  />
                ) : (
                  <p className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-800">
                    {user?.researchArea || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Role
                </label>
                <div className="py-2.5 px-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-600 capitalize">{user?.role}</p>
                  <span className="block text-xs text-slate-500 mt-1">
                    Role is managed by administrators
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Login
                </label>
                <p className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-800">
                  {user?.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString() + ' at ' + 
                      new Date(user.lastLogin).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 mt-6">
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
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                  {loading ? (
                    <>
                      <div className="spinner border-t-primary-500 mr-2"></div>
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

      {/* Account Statistics */}
      <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 glass-card bg-primary-50 border-primary-200 rounded-xl">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {statsLoading ? (
                <div className="spinner border-t-primary-500 mx-auto"></div>
              ) : (
                userStats.datasetsUploaded
              )}
            </div>
            <div className="text-sm text-primary-600">Datasets Uploaded</div>
          </div>
          <div className="text-center p-4 glass-card bg-emerald-50 border-emerald-200 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {statsLoading ? (
                <div className="spinner border-t-emerald-500 mx-auto"></div>
              ) : (
                userStats.analysesRun
              )}
            </div>
            <div className="text-sm text-emerald-600">Analyses Run</div>
          </div>
          <div className="text-center p-4 glass-card bg-blue-50 border-blue-200 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statsLoading ? (
                <div className="spinner border-t-blue-500 mx-auto"></div>
              ) : (
                userStats.visualizations
              )}
            </div>
            <div className="text-sm text-blue-600">Visualizations</div>
          </div>
          <div className="text-center p-4 glass-card bg-purple-50 border-purple-200 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {statsLoading ? (
                <div className="spinner border-t-purple-500 mx-auto"></div>
              ) : (
                userStats.daysActive
              )}
            </div>
            <div className="text-sm text-purple-600">Days Active</div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 glass-card rounded-xl hover:border-slate-300 transition-colors">
            <div className="mb-4 sm:mb-0">
              <h4 className="font-medium text-slate-800">Change Password</h4>
              <p className="text-sm text-slate-600 mt-1">Update your account password</p>
            </div>
            <button className="btn-secondary whitespace-nowrap">
              <Settings className="w-4 h-4 inline mr-2" />
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between p-5 glass-card rounded-xl">
            <div>
              <h4 className="font-medium text-slate-800">Account Status</h4>
              <p className="text-sm text-slate-600 mt-1">Your account is active and verified</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfilePage
