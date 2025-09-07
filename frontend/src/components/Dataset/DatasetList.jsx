import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Eye, 
  Trash2, 
  Download, 
  Calendar,
  FileText,
  Users,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DatasetList = ({ user, searchTerm, filterType, onDatasetSelect }) => {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchDatasets()
  }, [searchTerm, filterType, currentPage])

  const fetchDatasets = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType })
      }

      const response = await api.get('/datasets', { params })
      setDatasets(response.data.data.datasets)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error('Error fetching datasets:', error)
      toast.error('Failed to load datasets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (datasetId, datasetName) => {
    if (!window.confirm(`Are you sure you want to delete "${datasetName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/datasets/${datasetId}`)
      toast.success('Dataset deleted successfully')
      fetchDatasets()
    } catch (error) {
      console.error('Error deleting dataset:', error)
      const message = error.response?.data?.message || 'Failed to delete dataset'
      toast.error(message)
    }
  }

  const DatasetCard = ({ dataset }) => {
    const [showMenu, setShowMenu] = useState(false)
    const isOwner = dataset.uploadedBy._id === user._id

    return (
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">{dataset.name}</h3>
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
            
            {dataset.description && (
              <p className="text-gray-600 text-sm mb-3">{dataset.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {dataset.type.replace('_', ' ').toUpperCase()}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {dataset.sampleCount} samples
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(dataset.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              Uploaded by {dataset.uploadedBy.name} • {dataset.fileSizeFormatted || 'Unknown size'}
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onDatasetSelect(dataset)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  
                  {isOwner && (
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          handleDelete(dataset._id, dataset.name)
                          setShowMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {datasets.length > 0 ? (
        <>
          <div className="space-y-4">
            {datasets.map((dataset) => (
              <DatasetCard key={dataset._id} dataset={dataset} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'Start by uploading your first dataset'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button className="btn-primary">
              Upload Dataset
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DatasetList