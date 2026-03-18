import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, FileText, Download, Play } from 'lucide-react'
import ChartComponent from '../components/Visualization/ChartComponent'
import toast from 'react-hot-toast'
import CustomSelect from '../components/common/CustomSelect'
import api from '../services/api'
import { motion } from 'framer-motion'

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
      className={`p-6 glass-card cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'border-slate-200 hover:border-primary-500/50 hover:bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-slate-600'}`} />
        <h3 className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  )

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
        {/* Analysis Configuration */}
        <div className="space-y-6">
          {/* Dataset Selection */}
          <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Dataset</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="spinner border-t-primary-500"></div>
              </div>
            ) : (
              <CustomSelect
                value={selectedDataset?._id || ''}
                onChange={(val) => {
                  const dataset = datasets.find(d => d._id === val)
                  setSelectedDataset(dataset)
                  setAnalysisResults(null)
                }}
                options={datasets.map(dataset => ({
                  value: dataset._id,
                  label: `${dataset.name} (${dataset.sampleCount} samples)`
                }))}
                placeholder="Choose a dataset..."
              />
            )}
          </div>

          {/* Analysis Type Selection */}
          <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis Type</h3>
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
              <div className="mt-4 p-4 lg:p-6 glass-card rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
                <h4 className="font-medium text-slate-900 mb-3">Differential Analysis Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Condition 1
                    </label>
                    <input
                      type="text"
                      value={differentialParams.condition1}
                      onChange={(e) => setDifferentialParams(prev => ({
                        ...prev,
                        condition1: e.target.value
                      }))}
                      className="glass-input w-full text-sm"
                      placeholder="e.g., control"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Condition 2
                    </label>
                    <input
                      type="text"
                      value={differentialParams.condition2}
                      onChange={(e) => setDifferentialParams(prev => ({
                        ...prev,
                        condition2: e.target.value
                      }))}
                      className="glass-input w-full text-sm"
                      placeholder="e.g., treatment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      className="glass-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Run Analysis Button */}
            <div className="mt-6">
              <button
                onClick={runAnalysis}
                disabled={!selectedDataset || !analysisType || analysisLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                {analysisLoading ? (
                  <>
                    <div className="spinner border-t-primary-500 mr-2"></div>
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
            <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {analysisHistory.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg hover:border-slate-300 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {analysis.analysisType.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(analysis.performedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setAnalysisResults(analysis.results)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full"
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {/* Results Header */}
              <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Analysis Results - {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
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
                <div className="glass-card p-0 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
                  <div className="p-6 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-900">Statistical Summary</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-slate-50 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Feature
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Mean
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Median
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Std Dev
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Min
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Max
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {Object.entries(analysisResults).slice(0, 20).map(([feature, stats]) => (
                          <tr key={feature} className="hover:bg-slate-50 hover:bg-slate-100 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                              {feature}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {stats.mean?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {stats.median?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {stats.std?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {stats.min?.toFixed(3) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {stats.max?.toFixed(3) || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {Object.keys(analysisResults).length > 20 && (
                    <div className="p-4 border-t border-slate-200 text-center">
                      <p className="text-sm text-slate-500">
                        Showing first 20 features of {Object.keys(analysisResults).length} total
                      </p>
                    </div>
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
                  <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-6">Differential Expression Results</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="glass-card p-4 text-center rounded-xl">
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                          {analysisResults.significant_genes || 0}
                        </p>
                        <p className="text-sm text-slate-600">Significant Genes</p>
                      </div>
                      <div className="glass-card p-4 text-center rounded-xl bg-emerald-50 border-emerald-200">
                        <p className="text-3xl font-bold text-emerald-600 mb-1">
                          {analysisResults.upregulated || 0}
                        </p>
                        <p className="text-sm text-emerald-500">Upregulated</p>
                      </div>
                      <div className="glass-card p-4 text-center rounded-xl bg-rose-50 border-rose-200">
                        <p className="text-3xl font-bold text-rose-600 mb-1">
                          {analysisResults.downregulated || 0}
                        </p>
                        <p className="text-sm text-rose-500">Downregulated</p>
                      </div>
                    </div>

                    {analysisResults.top_genes && (
                      <div className="overflow-x-auto -mx-6">
                        <table className="min-w-full divide-y divide-white/10">
                          <thead className="bg-slate-50 backdrop-blur-sm">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                Gene
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                Log2 Fold Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                P-value
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                Regulation
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {analysisResults.top_genes.slice(0, 20).map((gene, index) => (
                              <tr key={index} className="hover:bg-slate-50 hover:bg-slate-100 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                  {gene.name || gene.gene}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                  {gene.log2fc?.toFixed(3)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                  {gene.pvalue?.toExponential(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    gene.log2fc > 0 
                                      ? 'bg-emerald-50 text-emerald-700 text-emerald-600 border border-emerald-200' 
                                      : 'bg-rose-50 text-rose-700 text-rose-600 border border-rose-200'
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
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-3">No Analysis Results</h3>
                <p className="text-slate-600 max-w-sm mx-auto">
                  Select a dataset and analysis type from the configuration panel, then click "Run Analysis" to generate insights.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AnalysisPage
