const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetData,
  updateDataset,
  deleteDataset
} = require('../controllers/datasetController');

const router = express.Router();

// @route   POST /api/datasets/upload
// @desc    Upload a new dataset
// @access  Private
router.post('/upload', 
  authMiddleware, 
  upload.single('dataset'), 
  handleMulterError,
  uploadDataset
);

// @route   GET /api/datasets
// @desc    Get all datasets for current user
// @access  Private
router.get('/', authMiddleware, getDatasets);

// @route   GET /api/datasets/:id
// @desc    Get specific dataset by ID
// @access  Private
router.get('/:id', authMiddleware, getDatasetById);

// @route   GET /api/datasets/:id/data
// @desc    Get dataset data for visualization
// @access  Private
router.get('/:id/data', authMiddleware, getDatasetData);

// @route   PUT /api/datasets/:id
// @desc    Update dataset
// @access  Private
router.put('/:id', authMiddleware, updateDataset);

// @route   DELETE /api/datasets/:id
// @desc    Delete dataset
// @access  Private
router.delete('/:id', authMiddleware, deleteDataset);

module.exports = router;