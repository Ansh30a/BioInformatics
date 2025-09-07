const axios = require('axios');
const Dataset = require('../models/Dataset');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Basic statistics analysis
const getBasicStats = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    // Add safety check for req.body
    if (!req.body) {
      req.body = {};
    }
    
    const { columns = [] } = req.body; // Default to empty array
    
    console.log('Basic stats request:', { datasetId, columns, body: req.body });

    // Get dataset
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString() && 
        !dataset.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this dataset'
      });
    }

    // Call Python service for analysis
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/stats`, {
      filePath: dataset.filePath,
      columns: columns
    });

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message
      });
    }

    // Save analysis results
    dataset.analysisResults.push({
      analysisType: 'basic_stats',
      results: response.data.data,
      performedBy: req.user._id
    });
    await dataset.save();

    res.json({
      success: true,
      message: 'Statistical analysis completed',
      data: response.data.data
    });

  } catch (error) {
    console.error('Basic stats error:', error);
    
    if (error.response) {
      return res.status(400).json({
        success: false,
        message: error.response.data.message || 'Python service error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during statistical analysis'
    });
  }
};

// Correlation analysis
const getCorrelation = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    // Add safety check for req.body
    if (!req.body) {
      req.body = {};
    }
    
    const { method = 'pearson' } = req.body;
    
    console.log('Correlation request:', { datasetId, method, body: req.body });

    // Get dataset
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString() && 
        !dataset.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this dataset'
      });
    }

    // Call Python service for correlation analysis
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/correlation`, {
      filePath: dataset.filePath,
      method
    });

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message
      });
    }

    // Save analysis results
    dataset.analysisResults.push({
      analysisType: 'correlation',
      results: response.data.data,
      performedBy: req.user._id
    });
    await dataset.save();

    res.json({
      success: true,
      message: 'Correlation analysis completed',
      data: response.data.data
    });

  } catch (error) {
    console.error('Correlation analysis error:', error);
    
    if (error.response) {
      return res.status(400).json({
        success: false,
        message: error.response.data.message || 'Python service error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during correlation analysis'
    });
  }
};

// Differential expression analysis
const getDifferentialAnalysis = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { condition1, condition2, pValueThreshold = 0.05 } = req.body;

    if (!condition1 || !condition2) {
      return res.status(400).json({
        success: false,
        message: 'Both condition1 and condition2 are required'
      });
    }

    // Get dataset
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString() && 
        !dataset.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this dataset'
      });
    }

    // Call Python service for differential analysis
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/differential`, {
      filePath: dataset.filePath,
      condition1,
      condition2,
      pValueThreshold
    });

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message
      });
    }

    // Save analysis results
    dataset.analysisResults.push({
      analysisType: 'differential_expression',
      results: response.data.data,
      performedBy: req.user._id
    });
    await dataset.save();

    res.json({
      success: true,
      message: 'Differential expression analysis completed',
      data: response.data.data
    });

  } catch (error) {
    console.error('Differential analysis error:', error);
    
    if (error.response) {
      return res.status(400).json({
        success: false,
        message: error.response.data.message || 'Python service error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during differential analysis'
    });
  }
};

// Get analysis history for a dataset
const getAnalysisHistory = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId)
      .populate('analysisResults.performedBy', 'name email')
      .select('analysisResults name uploadedBy');

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString() && 
        !dataset.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this dataset'
      });
    }

    res.json({
      success: true,
      data: {
        analysisHistory: dataset.analysisResults.sort((a, b) => 
          new Date(b.performedAt) - new Date(a.performedAt)
        )
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analysis history'
    });
  }
};

module.exports = {
  getBasicStats,
  getCorrelation,
  getDifferentialAnalysis,
  getAnalysisHistory
};