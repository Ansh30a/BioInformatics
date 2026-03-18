import React, { useState, useEffect } from 'react'
import DatasetList from '../components/Dataset/DatasetList'
import DatasetUpload from '../components/Dataset/DatasetUpload'
import DatasetView from '../components/Dataset/DatasetView'
import { Plus, Search, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomSelect from '../components/common/CustomSelect'

const DatasetsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset)
    setActiveTab('view')
  }

  const handleBackToList = () => {
    setSelectedDataset(null)
    setActiveTab('list')
  }

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-300 ${
        isActive
          ? 'bg-primary-50 border border-primary-100 text-primary-700 text-primary-600 border border-primary-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:bg-slate-100 border border-transparent'
      }`}
    >
      {label}
    </button>
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
      {/* Header Actions & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex space-x-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-white shadow-sm inline-flex">
          <TabButton
            id="list"
            label="My Datasets"
            isActive={activeTab === 'list'}
            onClick={setActiveTab}
          />
          <TabButton
            id="upload"
            label="Upload New"
            isActive={activeTab === 'upload'}
            onClick={setActiveTab}
          />
          {selectedDataset && (
            <TabButton
              id="view"
              label={`View: ${selectedDataset.name}`}
              isActive={activeTab === 'view'}
              onClick={setActiveTab}
            />
          )}
        </div>

        {activeTab !== 'upload' && (
          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary flex items-center mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Dataset
          </button>
        )}
      </div>

      {/* Search and Filter (only show on list tab) */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 relative z-50 overflow-visible"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pl-10 w-full"
                />
              </div>
              <div className="sm:w-48 relative z-[60]">
                <CustomSelect
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'gene_expression', label: 'Gene Expression' },
                    { value: 'microbiome', label: 'Microbiome' },
                    { value: 'protein', label: 'Protein' },
                    { value: 'metabolomics', label: 'Metabolomics' },
                    { value: 'other', label: 'Other' }
                  ]}
                  placeholder="Filter by type"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="glass-card p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Database Navigator</h3>
                <DatasetList
                  user={user}
                  searchTerm={searchTerm}
                  filterType={filterType}
                  onDatasetSelect={handleDatasetSelect}
                />
              </div>
            </motion.div>
          )}
          
          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DatasetUpload
                user={user}
                onUploadSuccess={() => setActiveTab('list')}
              />
            </motion.div>
          )}
          
          {activeTab === 'view' && selectedDataset && (
            <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DatasetView
                dataset={selectedDataset}
                user={user}
                onBack={handleBackToList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default DatasetsPage