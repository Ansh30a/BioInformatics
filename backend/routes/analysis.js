const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getBasicStats,
  getCorrelation,
  getDifferentialAnalysis,
  getAnalysisHistory
} = require('../controllers/analysisController');

const router = express.Router();

// @route   POST /api/analysis/:datasetId/stats
// @desc    Get basic statistics for dataset
// @access  Private
router.post('/:datasetId/stats', authMiddleware, getBasicStats);

// @route   POST /api/analysis/:datasetId/correlation
// @desc    Get correlation analysis for dataset
// @access  Private
router.post('/:datasetId/correlation', authMiddleware, getCorrelation);

// @route   POST /api/analysis/:datasetId/differential
// @desc    Get differential expression analysis
// @access  Private
router.post('/:datasetId/differential', authMiddleware, getDifferentialAnalysis);

// @route   GET /api/analysis/:datasetId/history
// @desc    Get analysis history for dataset
// @access  Private
router.get('/:datasetId/history', authMiddleware, getAnalysisHistory);

module.exports = router;