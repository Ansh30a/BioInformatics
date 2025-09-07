import React, { useState, useEffect } from 'react'
import { ArrowLeft, Download, BarChart3, Activity, Eye, Settings } from 'lucide-react'
import ChartComponent from '../Visualization/ChartComponent'
import Heatmap from '../Visualization/Heatmap'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DatasetView = ({ dataset, user, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [datasetData, setDatasetData] = useState(null)
  const [analysisResults, setAnalysisResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'data' && !datasetData) {
      fetchDatasetData()
    }
  }, [activeTab, dataset.id])

  const fetchDatasetData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/datasets/${dataset._id}/data?limit=1000`)
      setDatasetData(response.data.data)
    } catch (error) {
      console.error('Error fetching dataset data:', error)
      toast.error('Failed to load dataset data')
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async (analysisType) => {
  try {
    setAnalysisLoading(true)
    let response
    
    switch (analysisType) {
      case 'stats':
        response = await api.post(`/analysis/${dataset._id}/stats`, {
          columns: [] // Send empty array to analyze all columns
        })
        break
      case 'correlation':
        response = await api.post(`/analysis/${dataset._id}/correlation`, {
          method: 'pearson' // Default correlation method
        })
        break
      default:
        return
    }

    setAnalysisResults(prev => ({
      ...prev,
      [analysisType]: response.data.data
    }))
    toast.success('Analysis completed successfully')
  } catch (error) {
    console.error('Analysis error:', error)
    toast.error(error.response?.data?.message || 'Analysis failed')
  } finally {
    setAnalysisLoading(false)
  }
}


  // const runAnalysis = async (analysisType) => {
  //   try {
  //     setAnalysisLoading(true)
  //     let response
      
  //     switch (analysisType) {
  //       case 'stats':
  //         response = await api.post(`/analysis/${dataset._id}/stats`)
  //         break
  //       case 'correlation':
  //         response = await api.post(`/analysis/${dataset._id}/correlation`)
  //         break
  //       default:
  //         return
  //     }

  //     setAnalysisResults(prev => ({
  //       ...prev,
  //       [analysisType]: response.data.data
  //     }))
  //     toast.success('Analysis completed successfully')
  //   } catch (error) {
  //     console.error('Analysis error:', error)
  //     toast.error('Analysis failed')
  //   } finally {
  //     setAnalysisLoading(false)
  //   }
  // }

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700 border border-primary-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dataset.name}</h1>
            <p className="text-gray-600">
              {dataset.type.replace('_', ' ').toUpperCase()} • {dataset.sampleCount} samples
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button className="btn-secondary flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <TabButton
          id="overview"
          label="Overview"
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="data"
          label="Data"
          isActive={activeTab === 'data'}
          onClick={setActiveTab}
        />
        <TabButton
          id="visualization"
          label="Visualization"
          isActive={activeTab === 'visualization'}
          onClick={setActiveTab}
        />
        <TabButton
          id="analysis"
          label="Analysis"
          isActive={activeTab === 'analysis'}
          onClick={setActiveTab}
        />
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{dataset.type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samples:</span>
                    <span className="font-medium">{dataset.sampleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Genes/Features:</span>
                    <span className="font-medium">{dataset.geneCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">{dataset.fileSizeFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">{new Date(dataset.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
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
              </div>

              {dataset.metadata && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {dataset.metadata.organism && (
                      <div>
                        <span className="text-gray-600">Organism:</span>
                        <p className="font-medium">{dataset.metadata.organism}</p>
                      </div>
                    )}
                    {dataset.metadata.tissue && (
                      <div>
                        <span className="text-gray-600">Tissue:</span>
                        <p className="font-medium">{dataset.metadata.tissue}</p>
                      </div>
                    )}
                    {dataset.metadata.platform && (
                      <div>
                        <span className="text-gray-600">Platform:</span>
                        <p className="font-medium">{dataset.metadata.platform}</p>
                      </div>
                    )}
                    {dataset.metadata.studyType && (
                      <div>
                        <span className="text-gray-600">Study Type:</span>
                        <p className="font-medium">{dataset.metadata.studyType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dataset.description && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700">{dataset.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('data')}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Data
                  </button>
                  <button 
                    onClick={() => setActiveTab('visualization')}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Visualize
                  </button>
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Analyze
                  </button>
                </div>
              </div>

              {dataset.conditions && dataset.conditions.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conditions</h3>
                  <div className="space-y-2">
                    {dataset.conditions.map((condition, index) => (
                      <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="card">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
              </div>
            ) : datasetData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Dataset Preview</h3>
                  <p className="text-sm text-gray-600">
                    Showing {datasetData.rows.length} of {datasetData.metadata.totalRows} rows
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {datasetData.headers.map((header, index) => (
                          <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datasetData.rows.slice(0, 50).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof cell === 'number' ? cell.toFixed(3) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Click "View Data" to load dataset content</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visualization' && (
          <div className="space-y-6">
            {datasetData ? (
              <>
                <ChartComponent data={datasetData} />
                <Heatmap data={datasetData} />
              </>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-500 mb-4">Load data first to create visualizations</p>
                <button 
                  onClick={fetchDatasetData}
                  className="btn-primary"
                >
                  Load Data
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => runAnalysis('stats')}
                  disabled={analysisLoading}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Basic Statistics</h4>
                    <p className="text-sm text-gray-600">Mean, median, standard deviation</p>
                  </div>
                </button>
                <button
                  onClick={() => runAnalysis('correlation')}
                  disabled={analysisLoading}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Correlation Analysis</h4>
                    <p className="text-sm text-gray-600">Pearson correlation matrix</p>
                  </div>
                </button>
              </div>

              {analysisLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner mr-2"></div>
                  <span>Running analysis...</span>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {Object.keys(analysisResults).length > 0 && (
              <div className="space-y-4">
                {analysisResults.stats && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Feature
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mean
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Median
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Std Dev
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(analysisResults.stats).slice(0, 10).map(([feature, stats]) => (
                            <tr key={feature}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {feature}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stats.mean?.toFixed(3)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stats.median?.toFixed(3)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stats.std?.toFixed(3)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {analysisResults.correlation && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Correlation Matrix</h3>
                    <Heatmap data={analysisResults.correlation} isCorrelation={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DatasetView
