const Dataset = require('../models/Dataset');
const csvParser = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

// Upload and process dataset
const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, description, type, organism, tissue, platform, studyType, pubmedId, notes } = req.body;

    if (!name || !type) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Dataset name and type are required'
      });
    }

    // Parse CSV file
    const parsedData = await csvParser.parseCSV(req.file.path);
    
    if (!parsedData.success) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: parsedData.message
      });
    }

    // Extract conditions from data
    const conditions = [];
    if (parsedData.data.headers.includes('condition')) {
      const conditionIndex = parsedData.data.headers.indexOf('condition');
      const uniqueConditions = [...new Set(parsedData.data.rows.map(row => row[conditionIndex]))];
      conditions.push(...uniqueConditions.filter(c => c && c.trim()));
    }

    // Create dataset document
    const dataset = new Dataset({
      name: name.trim(),
      description: description?.trim(),
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      sampleCount: parsedData.data.rows.length,
      geneCount: parsedData.data.headers.length - 1, // Exclude sample ID column
      conditions,
      metadata: {
        organism: organism?.trim(),
        tissue: tissue?.trim(),
        platform: platform?.trim(),
        studyType: studyType?.trim(),
        pubmedId: pubmedId?.trim(),
        notes: notes?.trim()
      },
      columns: parsedData.data.headers.map(header => ({
        name: header,
        type: 'string', // Default type, can be enhanced with type detection
        isRequired: false
      })),
      dataPreview: {
        headers: parsedData.data.headers,
        rows: parsedData.data.rows.slice(0, 10), // First 10 rows for preview
        totalRows: parsedData.data.rows.length
      },
      status: 'ready'
    });

    await dataset.save();

    // Populate user info for response
    await dataset.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Dataset uploaded and processed successfully',
      data: {
        dataset
      }
    });

  } catch (error) {
    console.error('Upload dataset error:', error);
    
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during dataset upload'
    });
  }
};

// Get all datasets for current user
const getDatasets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Admin can see all datasets, users can see their own + public ones
    if (req.user.role !== 'admin') {
      query.$or = [
        { uploadedBy: req.user._id },
        { isPublic: true }
      ];
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = query.$or || [];
      const searchRegex = new RegExp(search, 'i');
      query.$and = [
        query.$or.length > 0 ? { $or: query.$or } : {},
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { 'metadata.organism': searchRegex }
          ]
        }
      ];
      delete query.$or;
    }

    const datasets = await Dataset.find(query)
      .populate('uploadedBy', 'name email institution')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Dataset.countDocuments(query);

    res.json({
      success: true,
      data: {
        datasets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching datasets'
    });
  }
};

// Get specific dataset by ID
const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await Dataset.findById(id)
      .populate('uploadedBy', 'name email institution')
      .populate('analysisResults.performedBy', 'name email');

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy._id.toString() !== req.user._id.toString() && 
        !dataset.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this dataset'
      });
    }

    res.json({
      success: true,
      data: {
        dataset
      }
    });

  } catch (error) {
    console.error('Get dataset by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching dataset'
    });
  }
};

// Get dataset data for visualization
const getDatasetData = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 1000, offset = 0 } = req.query;

    const dataset = await Dataset.findById(id);

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

    // Read and parse the data file
    const parsedData = await csvParser.parseCSV(dataset.filePath, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (!parsedData.success) {
      return res.status(500).json({
        success: false,
        message: 'Error reading dataset file'
      });
    }

    res.json({
      success: true,
      data: {
        headers: parsedData.data.headers,
        rows: parsedData.data.rows,
        metadata: {
          totalRows: dataset.dataPreview.totalRows,
          sampleCount: dataset.sampleCount,
          geneCount: dataset.geneCount
        }
      }
    });

  } catch (error) {
    console.error('Get dataset data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dataset data'
    });
  }
};

// Update dataset
const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, metadata } = req.body;

    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check ownership (admin or owner)
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to modify this dataset'
      });
    }

    // Update fields
    if (name) dataset.name = name.trim();
    if (description !== undefined) dataset.description = description.trim();
    if (typeof isPublic === 'boolean') dataset.isPublic = isPublic;
    
    if (metadata) {
      dataset.metadata = {
        ...dataset.metadata,
        ...metadata
      };
    }

    await dataset.save();

    res.json({
      success: true,
      message: 'Dataset updated successfully',
      data: {
        dataset
      }
    });

  } catch (error) {
    console.error('Update dataset error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating dataset'
    });
  }
};

// Delete dataset
const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Check ownership (admin or owner)
    if (req.user.role !== 'admin' && 
        dataset.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this dataset'
      });
    }

    // Delete the physical file
    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    // Delete the dataset document
    await Dataset.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });

  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dataset'
    });
  }
};

module.exports = {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetData,
  updateDataset,
  deleteDataset
};