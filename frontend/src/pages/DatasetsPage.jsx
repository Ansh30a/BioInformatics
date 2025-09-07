import React, { useState, useEffect } from 'react'
import DatasetList from '../components/Dataset/DatasetList'
import DatasetUpload from '../components/Dataset/DatasetUpload'
import DatasetView from '../components/Dataset/DatasetView'
import { Plus, Search, Filter } from 'lucide-react'

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600">Manage your biological datasets</p>
        </div>
        
        {activeTab !== 'upload' && (
          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Dataset
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
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

      {/* Search and Filter (only show on list tab) */}
      {activeTab === 'list' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="gene_expression">Gene Expression</option>
                <option value="microbiome">Microbiome</option>
                <option value="protein">Protein</option>
                <option value="metabolomics">Metabolomics</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'list' && (
          <DatasetList
            user={user}
            searchTerm={searchTerm}
            filterType={filterType}
            onDatasetSelect={handleDatasetSelect}
          />
        )}
        
        {activeTab === 'upload' && (
          <DatasetUpload
            user={user}
            onUploadSuccess={() => setActiveTab('list')}
          />
        )}
        
        {activeTab === 'view' && selectedDataset && (
          <DatasetView
            dataset={selectedDataset}
            user={user}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  )
}

export default DatasetsPage