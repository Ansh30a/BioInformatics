import axios from 'axios'
import { getToken, removeToken } from '../utils/auth'
import toast from 'react-hot-toast'

// Create axios instance with environment-based URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD 
      ? 'https://bioinformatics-backend.onrender.com/api'
      : 'http://localhost:5000/api'
    ),
  timeout: import.meta.env.VITE_API_TIMEOUT || 60000, // Default 60 seconds, configurable
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`API Call: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // Log detailed error information in development
    if (import.meta.env.DEV) {
      console.error('API Error Details:', {
        message: error.message,
        status: response?.status,
        data: response?.data,
        config: error.config
      })
    }

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          removeToken()
          window.location.href = '/login'
          toast.error('Session expired. Please login again.')
          break
        case 403:
          toast.error('Access denied.')
          break
        case 404:
          toast.error('Resource not found.')
          break
        case 408:
          toast.error('Request timeout. Please try again.')
          break
        case 413:
          toast.error('File too large. Please use a smaller file.')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        case 502:
          toast.error('Service temporarily unavailable. Please try again.')
          break
        case 503:
          toast.error('Service unavailable. Please try again later.')
          break
        case 504:
          toast.error('Request timeout. The operation may still be processing.')
          break
        default:
          const message = response.data?.message || 'An error occurred'
          toast.error(message)
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('Request failed. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api
