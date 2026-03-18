import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Database, 
  BarChart3, 
  FileBox, 
  MoreHorizontal,
  ChevronDown
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
        totalAnalyses: datasets.reduce((acc, dataset) => acc + (dataset.analysisResults?.length || 0), 0),
        recentUploads: datasets.filter(d => new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[1400px] mx-auto pb-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column (Stats, Chart, Table) */}
        <div className="lg:col-span-8 flex flex-col space-y-6 lg:space-y-8">
          
          {/* 1. Top Stats Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="glass-card p-4 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mr-4">
                <Database className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Datasets</p>
                <p className="text-xl font-bold text-slate-800">{stats.totalDatasets}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-4">
                <FileBox className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Recent Uploads</p>
                <p className="text-xl font-bold text-slate-800">{stats.recentUploads}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mr-4">
                <BarChart3 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Analyses Run</p>
                <p className="text-xl font-bold text-slate-800">{stats.totalAnalyses}</p>
              </div>
            </div>
          </div>

          {/* 2. Main Chart Area */}
          <div className="glass-card p-6 lg:p-8 flex-1 min-h-[360px] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Average Quality Score</h3>
                <div className="flex items-end space-x-3">
                  <span className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">84.5%</span>
                  <span className="text-sm font-medium text-slate-400 mb-1">- 2.34%</span>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <span>Past 3 months</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-end justify-between px-2 sm:px-10 h-48 lg:h-56 mt-auto">
              {/* Aesthetic CSS Bar Chart mimicking reference */}
              {[
                { h1: '60%', h2: '30%', month: 'Feb' },
                { h1: '75%', h2: '45%', month: 'Mar' },
                { h1: '50%', h2: '60%', month: 'Apr' },
                { h1: '80%', h2: '55%', month: 'May' },
                { h1: '40%', h2: '20%', month: 'Jun' },
                { h1: '90%', h2: '70%', month: 'Jul' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center group h-full justify-end">
                  <div className="w-3 sm:w-4 bg-slate-100 rounded-full h-[80%] relative flex items-end overflow-hidden group-hover:bg-slate-200 transition-colors duration-300">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-300 to-orange-400/80 rounded-full z-10" 
                      style={{ height: bar.h1 }}
                    ></div>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-full z-20 shadow-[0_-2px_6px_rgba(0,0,0,0.1)]" 
                      style={{ height: bar.h2 }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 mt-4 uppercase tracking-wider">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Bottom Table */}
          <div className="glass-card p-6 lg:p-8 flex-1 h-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Datasets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="pb-4 font-semibold w-1/4">ID</th>
                    <th className="pb-4 font-semibold w-1/3">Name</th>
                    <th className="pb-4 font-semibold w-1/4">Status</th>
                    <th className="pb-4 font-semibold text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100/60">
                  {recentDatasets.length > 0 ? recentDatasets.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 font-medium text-slate-600">ID-{d._id.substring(0,6).toUpperCase()}</td>
                      <td className="py-4 font-bold text-slate-800 truncate max-w-[150px]">{d.name}</td>
                      <td className="py-4 font-medium text-slate-500 capitalize">{d.type.replace('_', ' ')}</td>
                      <td className="py-4 flex justify-end items-center">
                        <div className="w-20 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex mr-4">
                          <div className="h-full bg-orange-400 rounded-l-full" style={{ width: `${40 + (i * 10)}%` }}></div>
                          <div className="h-full bg-amber-200" style={{ width: '20%' }}></div>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-slate-500 cursor-pointer" />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500 text-sm">No recent datasets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col space-y-6 lg:space-y-8 h-full">
          
          {/* Black Contrast Card */}
          <div className="dark-card p-6 sm:p-8 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Upcoming Tasks</h3>
            
            <div className="space-y-6 flex-1 relative z-10">
              {[
                { title: 'Genomic Sequence Alignment', time: 'Today 06:00-08:00', border: 'border-orange-500' },
                { title: 'Data Normalization Check', time: 'Today 14:00-15:30', border: 'border-amber-400' },
                { title: 'Protein Model Rendering', time: 'Tomorrow 09:00-11:00', border: 'border-white/20' }
              ].map((task, i) => (
                <div key={i} className="flex space-x-4 group cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors">
                  <div className="w-4 flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${task.border} mt-1`} />
                    {i !== 2 && <div className="w-px h-12 bg-white/10 mt-2" />}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-white/90 group-hover:text-white transition-colors">{task.title}</h4>
                    <p className="text-xs font-medium text-white/50 mt-1">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Working Format / Progress Bars */}
          <div className="glass-card p-6 sm:p-8 flex-1 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Storage Allocation</h3>
            
            <div className="space-y-6 lg:space-y-8 flex-1 flex flex-col justify-center">
              {[
                { label: 'Raw Files', used: '13,982', pct: '11.4%', color: 'from-orange-100 to-orange-200', textColors: 'text-orange-600' },
                { label: 'Processed', used: '26,214', pct: '32.2%', color: 'from-amber-100 to-amber-200', textColors: 'text-amber-600' },
                { label: 'System', used: '41,214', pct: '56.4%', color: 'from-orange-300 to-orange-400', textColors: 'text-orange-700' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="w-24">
                    <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wide">{item.label}</p>
                    <p className="text-[15px] font-bold text-slate-800">{item.used}</p>
                  </div>
                  
                  <div className="flex-1 ml-4 relative h-10 sm:h-12 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center">
                    <div 
                      className={`h-full absolute left-0 bg-gradient-to-r ${item.color} group-hover:opacity-90 transition-opacity`}
                      style={{ width: item.pct }}
                    />
                    <span className={`relative z-10 w-full text-right pr-4 text-xs font-bold ${item.textColors}`}>
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  )
}

export default HomePage
