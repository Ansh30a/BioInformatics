import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Dna } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { setToken } from '../../utils/auth'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true)

    try {
      const response = await api.post('/auth/login', formData)
      const { user, token } = response.data.data

      setToken(token)
      onLogin(user)
      toast.success('Login successful!')
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your bioinformatics data platform
          </p>
        </div>

        <div className="glass-card py-6 px-4 sm:py-8 sm:px-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
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
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input w-full pr-10"
                    placeholder="Enter your password"
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
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
