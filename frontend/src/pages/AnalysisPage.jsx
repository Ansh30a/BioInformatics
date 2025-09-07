import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, FileText, Download, Play } from 'lucide-react'
import ChartComponent from '../components/Visualization/ChartComponent'
import Heatmap from '../components/Visualization/Heatmap'
import toast from 'react-hot-toast'
import api from '../services/api'

const AnalysisPage = ({ user }) => {
  const [datasets, setDatasets] = useState([])
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [analysisType, setAnalysisType] = useState('')
  const [analysisResults, setAnalysisResults] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [differentialParams, setDifferentialParams] = useState({
    condition1: '',
    condition2: '',
    pValueThreshold: 0.05
  })

  useEffect(() => {
    fetchDatasets()
  }, [])

  useEffect(() => {
    if (selectedDataset) {
      fetchAnalysisHistory()
    }
  }, [selectedDataset])

  const fetchDatasets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/datasets')
      setDatasets(response.data.data.datasets.filter(d => d.status === 'ready'))
    } catch (error) {
      console.error('Error fetching datasets:', error)
      toast.error('Failed to load datasets')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysisHistory = async () => {
    try {
      const response = await api.get(`/analysis/${selectedDataset._id}/history`)
      setAnalysisHistory(response.data.data.analysisHistory)
    } catch (error) {
      console.error('Error fetching analysis history:', error)
    }
  }

  const runAnalysis = async () => {
    if (!selectedDataset || !analysisType) {
      toast.error('Please select a dataset and analysis type')
      return
    }

    try {
      setAnalysisLoading(true)
      let response

      switch (analysisType) {
        case 'stats':
          response = await api.post(`/analysis/${selectedDataset._id}/stats`)
          break
        case 'correlation':
          response = await api.post(`/analysis/${selectedDataset._id}/correlation`)
          break
        case 'differential':
          if (!differentialParams.condition1 || !differentialParams.condition2) {
            toast.error('Please specify both conditions for differential analysis')
            return
          }
          response = await api.post(`/analysis/${selectedDataset._id}/differential`, differentialParams)
          break
        default:
          toast.error('Invalid analysis type')
          return
      }

      setAnalysisResults(response.data.data)
      toast.success('Analysis completed successfully!')
      fetchAnalysisHistory() // Refresh history
    } catch (error) {
      console.error('Analysis error:', error)
      const message = error.response?.data?.message || 'Analysis failed'
      toast.error(message)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const exportResults = () => {
    if (!analysisResults) {
      toast.error('No results to export')
      return
    }

    const dataStr = JSON.stringify(analysisResults, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `analysis_${analysisType}_${selectedDataset.name}_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Results exported successfully!')
  }

  const AnalysisCard = ({ type, title, description, icon: Icon, isSelected, onClick }) => (
    <div
      onClick={() => onClick(type)}
      className={`p-6 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
        <h3 className={`font-semibold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Analysis</h1>
        <p className="text-gray-600">Perform statistical analysis on your datasets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Configuration */}
        <div className="space-y-6">
          {/* Dataset Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Dataset</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="spinner"></div>
              </div>
            ) : (
              <select
                value={selectedDataset?._id || ''}
                onChange={(e) => {
                  const dataset = datasets.find(d => d._id === e.target.value)
                  setSelectedDataset(dataset)
                  setAnalysisResults(null)
                }}
                className="input-field"
              >
                <option value="">Choose a dataset...</option>
                {datasets.map(dataset => (
                  <option key={dataset._id} value={dataset._id}>
                    {dataset.name} ({dataset.sampleCount} samples)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Analysis Type Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Type</h3>
            <div className="space-y-3">
              <AnalysisCard
                type="stats"
                title="Basic Statistics"
                description="Calculate mean, median, standard deviation for each feature"
                icon={BarChart3}
                isSelected={analysisType === 'stats'}
                onClick={setAnalysisType}
              />
              <AnalysisCard
                type="correlation"
                title="Correlation Analysis"
                description="Compute Pearson correlation matrix between features"
                icon={TrendingUp}
                isSelected={analysisType === 'correlation'}
                onClick={setAnalysisType}
              />
              <AnalysisCard
                type="differential"
                title="Differential Analysis"
                description="Compare expression between two conditions"
                icon={Activity}
                isSelected={analysisType === 'differential'}
                onClick={setAnalysisType}
              />
            </div>

            {/* Differential Analysis Parameters */}
            {analysisType === 'differential' && selectedDataset && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Differential Analysis Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition 1
                    </label>
                    <input
                      type="text"
                      value={differentialParams.condition1}
                      onChange={(e) => setDifferentialParams(prev => ({
                        ...prev,
                        condition1: e.target.value
                      }))}
                      className="input-field text-sm"
                      placeholder="e.g., control"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition 2
                    </label>
                    <input
                      type="text"
                      value={differentialParams.condition2}
                      onChange={(e) => setDifferentialParams(prev => ({
                        ...prev,
                        condition2: e.target.value
                      }))}
                      className="input-field text-sm"
                      placeholder="e.g., treatment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      P-value Threshold
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={differentialParams.pValueThreshold}
                      onChange={(e) => setDifferentialParams(prev => ({
                        ...prev,
                        pValueThreshold: parseFloat(e.target.value)
                      }))}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Run Analysis Button */}
            <div className="mt-4">
              <button
                onClick={runAnalysis}
                disabled={!selectedDataset || !analysisType || analysisLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {analysisLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis History */}
          {analysisHistory.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysisHistory.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {analysis.analysisType.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.performedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setAnalysisResults(analysis.results)}
                      className="text-xs text-primary-600 hover:text-primary-800"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {analysisResults ? (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analysis Results - {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dataset: {selectedDataset?.name} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={exportResults}
                    className="btn-secondary flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Statistics Results */}
              {analysisType === 'stats' && (
                <div className="card">
                  <h4 className="font-semibold text-gray-900 mb-4">Statistical Summary</h4>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Max
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(analysisResults).slice(0, 20).map(([feature, stats]) => (
                          <tr key={feature} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {feature}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stats.mean?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stats.median?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stats.std?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stats.min?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stats.max?.toFixed(3) || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {Object.keys(analysisResults).length > 20 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 20 features of {Object.keys(analysisResults).length} total
                    </p>
                  )}
                </div>
              )}

              {/* Correlation Results */}
              {analysisType === 'correlation' && (
                <Heatmap data={analysisResults} isCorrelation={true} />
              )}

              {/* Differential Results */}
              {analysisType === 'differential' && (
                <div className="space-y-4">
                  <div className="card">
                    <h4 className="font-semibold text-gray-900 mb-4">Differential Expression Results</h4>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {analysisResults.significant_genes || 0}
                        </p>
                        <p className="text-sm text-gray-600">Significant Genes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {analysisResults.upregulated || 0}
                        </p>
                        <p className="text-sm text-gray-600">Upregulated</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {analysisResults.downregulated || 0}
                        </p>
                        <p className="text-sm text-gray-600">Downregulated</p>
                      </div>
                    </div>

                    {analysisResults.top_genes && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gene
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Log2 Fold Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P-value
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Regulation
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analysisResults.top_genes.slice(0, 20).map((gene, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {gene.name || gene.gene}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {gene.log2fc?.toFixed(3)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {gene.pvalue?.toExponential(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    gene.log2fc > 0 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {gene.log2fc > 0 ? 'Up' : 'Down'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
                <p className="text-gray-500 mb-6">
                  Select a dataset and analysis type, then click "Run Analysis" to see results here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
