import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Dna } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { setToken } from '../../utils/auth'

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    researchArea: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...submitData } = formData
      const response = await api.post('/auth/register', submitData)
      const { user, token } = response.data.data

      setToken(token)
      onLogin(user)
      toast.success('Account created successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-app-container min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 border border-primary-200 shadow-[0_0_20px_rgba(99,102,241,0.2)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the bioinformatics research platform
          </p>
        </div>

        <div className="glass-card py-6 px-4 sm:py-8 sm:px-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  value={formData.institution}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="Your university or research institution"
                />
              </div>

              <div>
                <label htmlFor="researchArea" className="block text-sm font-medium text-gray-700 mb-1">
                  Research Area
                </label>
                <input
                  id="researchArea"
                  name="researchArea"
                  type="text"
                  value={formData.researchArea}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="e.g., Genomics, Proteomics, Bioinformatics"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input w-full pr-10"
                    placeholder="Create a password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2.5 sm:py-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
