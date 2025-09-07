import React, { useState } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DatasetUpload = ({ user, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'gene_expression',
    organism: '',
    tissue: '',
    platform: '',
    studyType: '',
    pubmedId: '',
    notes: ''
  })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['.csv', '.tsv', '.txt']
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please select a CSV, TSV, or TXT file')
      return
    }
    
    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB
      toast.error('File size must be less than 100MB')
      return
    }
    
    setFile(selectedFile)
    
    // Auto-fill name if empty
    if (!formData.name) {
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({ ...prev, name: nameWithoutExtension }))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }
    
    if (!formData.name.trim()) {
      toast.error('Please provide a dataset name')
      return
    }

    setUploading(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append('dataset', file)
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitFormData.append(key, formData[key])
        }
      })

      await api.post('/datasets/upload', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000 // 5 minutes timeout for large files
      })

      toast.success('Dataset uploaded successfully!')
      onUploadSuccess()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'gene_expression',
        organism: '',
        tissue: '',
        platform: '',
        studyType: '',
        pubmedId: '',
        notes: ''
      })
      setFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      const message = error.response?.data?.message || 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Dataset File</h3>
          
          <div
            className={`drag-drop-zone ${dragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Choose a file or drag and drop
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  CSV, TSV, or TXT files up to 100MB
                </p>
                <button type="button" className="btn-primary">
                  Select File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dataset Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter dataset name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="gene_expression">Gene Expression</option>
                <option value="microbiome">Microbiome</option>
                <option value="protein">Protein</option>
                <option value="metabolomics">Metabolomics</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Brief description of the dataset"
              />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organism
              </label>
              <input
                type="text"
                name="organism"
                value={formData.organism}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Homo sapiens"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tissue/Sample Type
              </label>
              <input
                type="text"
                name="tissue"
                value={formData.tissue}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., liver tissue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform/Technology
              </label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Illumina HiSeq"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Type
              </label>
              <input
                type="text"
                name="studyType"
                value={formData.studyType}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., case-control"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PubMed ID
              </label>
              <input
                type="text"
                name="pubmedId"
                value={formData.pubmedId}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 12345678"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Any additional information about the dataset"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onUploadSuccess}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Uploading...
              </div>
            ) : (
              <div className="flex items-center">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Upload Dataset
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DatasetUpload