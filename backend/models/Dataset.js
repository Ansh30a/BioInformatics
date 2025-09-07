const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dataset name is required'],
    trim: true,
    maxlength: [100, 'Dataset name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Dataset type is required'],
    enum: ['gene_expression', 'microbiome', 'protein', 'metabolomics', 'other']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sampleCount: {
    type: Number,
    required: [true, 'Sample count is required']
  },
  geneCount: {
    type: Number
  },
  conditions: [{
    type: String,
    trim: true
  }],
  metadata: {
    organism: String,
    tissue: String,
    platform: String,
    studyType: String,
    pubmedId: String,
    notes: String
  },
  columns: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean']
    },
    isRequired: Boolean
  }],
  dataPreview: {
    headers: [String],
    rows: [[mongoose.Schema.Types.Mixed]],
    totalRows: Number
  },
  analysisResults: [{
    analysisType: String,
    results: mongoose.Schema.Types.Mixed,
    performedAt: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing'
  },
  processingErrors: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
datasetSchema.index({ uploadedBy: 1, createdAt: -1 });
datasetSchema.index({ type: 1 });
datasetSchema.index({ isPublic: 1 });

// Virtual for file size in human readable format
datasetSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

module.exports = mongoose.model('Dataset', datasetSchema);