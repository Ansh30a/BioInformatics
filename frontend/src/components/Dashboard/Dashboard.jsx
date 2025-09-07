import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Database,
  BarChart3,
  Users,
  FileSpreadsheet,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  Calendar,
  Clock,
  Eye,
  Download,
  MoreVertical
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import api from '../../services/api'
import toast from 'react-hot-toast'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDatasets: 0,
      totalAnalyses: 0,
      recentUploads: 0,
      activeUsers: 1
    },
    recentDatasets: [],
    recentAnalyses: [],
    chartData: null
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch datasets
      const datasetsResponse = await api.get('/datasets?limit=10')
      const datasets = datasetsResponse.data.data.datasets || []
      
      // Calculate stats
      const totalAnalyses = datasets.reduce((acc, dataset) => 
        acc + (dataset.analysisResults?.length || 0), 0
      )
      
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentUploads = datasets.filter(dataset => 
        new Date(dataset.createdAt) > weekAgo
      ).length

      // Prepare chart data
      const chartData = prepareChartData(datasets)

      setDashboardData({
        stats: {
          totalDatasets: datasets.length,
          totalAnalyses,
          recentUploads,
          activeUsers: 1
        },
        recentDatasets: datasets.slice(0, 5),
        recentAnalyses: getRecentAnalyses(datasets),
        chartData
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (datasets) => {
    // Upload trends over time
    const uploadTrends = getUploadTrends(datasets)
    
    // Dataset types distribution
    const datasetTypes = getDatasetTypesDistribution(datasets)
    
    // Analysis types distribution
    const analysisTypes = getAnalysisTypesDistribution(datasets)

    return {
      uploadTrends,
      datasetTypes,
      analysisTypes
    }
  }

  const getUploadTrends = (datasets) => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const uploadsOnDate = datasets.filter(dataset => {
        const uploadDate = new Date(dataset.createdAt).toISOString().split('T')[0]
        return uploadDate === dateStr
      }).length
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: uploadsOnDate
      })
    }

    return {
      labels: last7Days.map(d => d.date),
      datasets: [{
        label: 'Daily Uploads',
        data: last7Days.map(d => d.uploads),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    }
  }

  const getDatasetTypesDistribution = (datasets) => {
    const types = {}
    datasets.forEach(dataset => {
      const type = dataset.type || 'other'
      types[type] = (types[type] || 0) + 1
    })

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 101, 101, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ]

    return {
      labels: Object.keys(types).map(type => 
        type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ),
      datasets: [{
        data: Object.values(types),
        backgroundColor: colors.slice(0, Object.keys(types).length),
        borderWidth: 0
      }]
    }
  }

  const getAnalysisTypesDistribution = (datasets) => {
    const analysisTypes = {}
    
    datasets.forEach(dataset => {
      if (dataset.analysisResults) {
        dataset.analysisResults.forEach(analysis => {
          const type = analysis.analysisType || 'unknown'
          analysisTypes[type] = (analysisTypes[type] || 0) + 1
        })
      }
    })

    return {
      labels: Object.keys(analysisTypes).map(type =>
        type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ),
      datasets: [{
        label: 'Analysis Count',
        data: Object.values(analysisTypes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderWidth: 1
      }]
    }
  }

  const getRecentAnalyses = (datasets) => {
    const analyses = []
    
    datasets.forEach(dataset => {
      if (dataset.analysisResults) {
        dataset.analysisResults.forEach(analysis => {
          analyses.push({
            ...analysis,
            datasetName: dataset.name,
            datasetId: dataset._id
          })
        })
      }
    })

    return analyses
      .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt))
      .slice(0, 5)
  }

  const StatCard = ({ icon: Icon, title, value, change, color = "primary", trend = "up" }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change && (
              <div className={`flex items-center text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowUpRight className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{change}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ icon: Icon, title, description, to, color = "primary" }) => (
    <Link
      to={to}
      className={`block p-4 border border-gray-200 rounded-lg hover:border-${color}-300 hover:bg-${color}-50 transition-colors group`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 text-${color}-600 group-hover:text-${color}-700`} />
        <div>
          <h4 className="font-medium text-gray-900 group-hover:text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )

  const RecentDatasetCard = ({ dataset }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 truncate">{dataset.name}</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
          <span className="flex items-center">
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            {dataset.type?.replace('_', ' ').toUpperCase()}
          </span>
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {dataset.sampleCount} samples
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(dataset.createdAt).toLocaleDateString()}
          </span>
        </div>
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
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const RecentAnalysisCard = ({ analysis }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <Activity className="w-4 h-4 text-green-600" />
          <h4 className="font-medium text-gray-900">
            {analysis.analysisType?.replace('_', ' ').toUpperCase()}
          </h4>
        </div>
        <p className="text-sm text-gray-600 truncate">{analysis.datasetName}</p>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(analysis.performedAt).toLocaleDateString()}
        </div>
      </div>
      <button className="p-1 text-gray-400 hover:text-primary-600 rounded">
        <Eye className="w-4 h-4" />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your bioinformatics research today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Database}
          title="Total Datasets"
          value={dashboardData.stats.totalDatasets}
          change={12}
          color="primary"
        />
        <StatCard
          icon={BarChart3}
          title="Analyses Run"
          value={dashboardData.stats.totalAnalyses}
          change={8}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Recent Uploads"
          value={dashboardData.stats.recentUploads}
          change={25}
          color="blue"
        />
        <StatCard
          icon={Activity}
          title="Active Projects"
          value={dashboardData.recentDatasets.filter(d => d.status === 'ready').length}
          change={5}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Trends */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upload Trends</h3>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-64">
            {dashboardData.chartData?.uploadTrends && (
              <Line data={dashboardData.chartData.uploadTrends} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Dataset Types */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Types</h3>
          <div className="h-64">
            {dashboardData.chartData?.datasetTypes && (
              <Doughnut data={dashboardData.chartData.datasetTypes} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={Plus}
            title="Upload Dataset"
            description="Add new biological data"
            to="/datasets"
            color="primary"
          />
          <QuickActionCard
            icon={BarChart3}
            title="Run Analysis"
            description="Analyze existing datasets"
            to="/analysis"
            color="green"
          />
          <QuickActionCard
            icon={Eye}
            title="View Results"
            description="Browse analysis results"
            to="/datasets"
            color="blue"
          />
          <QuickActionCard
            icon={Download}
            title="Export Data"
            description="Download processed data"
            to="/datasets"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Datasets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Datasets</h3>
            <Link to="/datasets" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentDatasets.length > 0 ? (
              dashboardData.recentDatasets.map(dataset => (
                <RecentDatasetCard key={dataset._id} dataset={dataset} />
              ))
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No datasets yet</p>
                <Link to="/datasets" className="btn-primary">
                  Upload Your First Dataset
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
            <Link to="/analysis" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentAnalyses.length > 0 ? (
              dashboardData.recentAnalyses.map((analysis, index) => (
                <RecentAnalysisCard key={index} analysis={analysis} />
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No analyses yet</p>
                <Link to="/analysis" className="btn-primary">
                  Run Your First Analysis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Types Chart */}
      {dashboardData.chartData?.analysisTypes && Object.keys(dashboardData.chartData.analysisTypes).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Distribution</h3>
          <div className="h-64">
            <Bar data={dashboardData.chartData.analysisTypes} options={chartOptions} />
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Backend Service</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Python Service</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Database</span>
            </div>
            <span className="text-sm text-green-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
