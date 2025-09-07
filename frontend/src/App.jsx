import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import HomePage from './pages/HomePage'
import DatasetsPage from './pages/DatasetsPage'
import AnalysisPage from './pages/AnalysisPage'
import ProfilePage from './pages/ProfilePage'
import { getToken, removeToken } from './utils/auth'
import api from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [servicesReady, setServicesReady] = useState(false)

  useEffect(() => {
    // Wake up services and check authentication
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Wake up backend and python services
      await wakeUpServices()
      
      // Then check authentication
      await checkAuth()
    } catch (error) {
      console.error('App initialization error:', error)
      setLoading(false)
    }
  }

  const wakeUpServices = async () => {
    console.log('Waking up services...')
    
    const wakeUpPromises = [
      // Wake up backend service
      fetch('https://bioinformatics-backend.onrender.com/api/health', {
        method: 'GET',
        mode: 'cors'
      }).catch(() => console.log('Backend starting up...')),
      
      // Wake up python service
      fetch('https://bioinformatics-python-service.onrender.com/api/health', {
        method: 'GET',
        mode: 'cors'
      }).catch(() => console.log('Python service starting up...'))
    ]
    
    try {
      await Promise.allSettled(wakeUpPromises)
      console.log('Services wake-up completed')
      setServicesReady(true)
    } catch (error) {
      console.log('Some services may still be starting up...')
      setServicesReady(true) // Continue anyway
    }
  }

  const checkAuth = async () => {
    const token = getToken()
    if (token) {
      try {
        const response = await api.get('/auth/profile')
        setUser(response.data.data.user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        removeToken()
        setIsAuthenticated(false)
      }
    } else {
      setIsAuthenticated(false)
    }
    setLoading(false)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {!servicesReady ? 'Starting up services...' : 'Loading application...'}
          </h2>
          <p className="text-gray-500">
            {!servicesReady ? 'This may take up to 30 seconds on first load' : 'Please wait a moment'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/datasets" element={<DatasetsPage user={user} />} />
        <Route path="/analysis" element={<AnalysisPage user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
