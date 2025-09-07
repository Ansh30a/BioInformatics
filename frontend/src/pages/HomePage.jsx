import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Database, 
  BarChart3, 
  Users, 
  FileSpreadsheet,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react'
import api from '../services/api'

const HomePage = ({ user }) => {
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalAnalyses: 0,
    recentUploads: 0
  })
  const [recentDatasets, setRecentDatasets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [datasetsResponse] = await Promise.all([
        api.get('/datasets?limit=5')
      ])

      const datasets = datasetsResponse.data.data.datasets
      setRecentDatasets(datasets)
      
      setStats({
        totalDatasets: datasetsResponse.data.data.pagination.total,
        totalAnalyses: datasets.reduce((acc, dataset) => 
          acc + (dataset.analysisResults?.length || 0), 0
        ),
        recentUploads: datasets.filter(dataset => {
          const uploadDate = new Date(dataset.createdAt)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return uploadDate > weekAgo
        }).length
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color = "primary" }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Manage your biological datasets and perform advanced analysis with our comprehensive platform.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Database}
          title="Total Datasets"
          value={stats.totalDatasets}
          color="primary"
        />
        <StatCard
          icon={BarChart3}
          title="Analyses Performed"
          value={stats.totalAnalyses}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Recent Uploads"
          value={stats.recentUploads}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/datasets"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">Upload Dataset</span>
          </Link>
          
          <Link
            to="/datasets"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">View Datasets</span>
          </Link>
          
          <Link
            to="/analysis"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Activity className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">Run Analysis</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Users className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">Profile Settings</span>
          </Link>
        </div>
      </div>

      {/* Recent Datasets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Datasets</h2>
          <Link
            to="/datasets"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            View all datasets
          </Link>
        </div>
        
        {recentDatasets.length > 0 ? (
          <div className="space-y-3">
            {recentDatasets.map((dataset) => (
              <div
                key={dataset._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                  <p className="text-sm text-gray-500">
                    {dataset.type.replace('_', ' ').toUpperCase()} • {dataset.sampleCount} samples
                  </p>
                  <p className="text-xs text-gray-400">
                    Uploaded {new Date(dataset.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    dataset.status === 'ready' 
                      ? 'bg-green-100 text-green-800'
                      : dataset.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dataset.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No datasets uploaded yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Start by uploading your first biological dataset
            </p>
            <Link to="/datasets" className="btn-primary">
              Upload Dataset
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage