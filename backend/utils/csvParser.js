const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Parse CSV file and return structured data
const parseCSV = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const { limit = null, offset = 0 } = options;
    
    if (!fs.existsSync(filePath)) {
      return resolve({
        success: false,
        message: 'File not found'
      });
    }

    const results = [];
    let headers = [];
    let rowCount = 0;
    let skippedRows = 0;

    const fileExtension = path.extname(filePath).toLowerCase();
    const delimiter = fileExtension === '.tsv' ? '\t' : ',';

    fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on('headers', (headerList) => {
        headers = headerList;
      })
      .on('data', (data) => {
        // Skip rows if offset is specified
        if (skippedRows < offset) {
          skippedRows++;
          return;
        }

        // Stop if limit is reached
        if (limit && results.length >= limit) {
          return;
        }

        // Convert data object to array maintaining header order
        const row = headers.map(header => {
          const value = data[header];
          // Try to convert numeric strings to numbers
          if (value && !isNaN(value) && value.trim() !== '') {
            return parseFloat(value);
          }
          return value || '';
        });

        results.push(row);
        rowCount++;
      })
      .on('end', () => {
        // Validate data
        if (headers.length === 0) {
          return resolve({
            success: false,
            message: 'No headers found in the CSV file'
          });
        }

        if (results.length === 0) {
          return resolve({
            success: false,
            message: 'No data rows found in the CSV file'
          });
        }

        // Basic validation
        const invalidRows = results.filter(row => row.length !== headers.length);
        if (invalidRows.length > 0) {
          console.warn(`Warning: ${invalidRows.length} rows have inconsistent column count`);
        }

        resolve({
          success: true,
          data: {
            headers,
            rows: results,
            totalRows: rowCount,
            hasMoreData: limit && results.length === limit
          }
        });
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        resolve({
          success: false,
          message: 'Error parsing CSV file: ' + error.message
        });
      });
  });
};

// Analyze CSV structure and data types
const analyzeCSV = async (filePath) => {
  try {
    const parseResult = await parseCSV(filePath, { limit: 100 });
    
    if (!parseResult.success) {
      return parseResult;
    }

    const { headers, rows } = parseResult.data;
    const analysis = {
      columnCount: headers.length,
      rowCount: rows.length,
      columns: []
    };

    // Analyze each column
    headers.forEach((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => val !== null && val !== '');
      
      const columnAnalysis = {
        name: header,
        type: detectDataType(columnData),
        nullCount: rows.length - columnData.length,
        uniqueValues: [...new Set(columnData)].length,
        sampleValues: columnData.slice(0, 5)
      };

      if (columnAnalysis.type === 'number') {
        const numericData = columnData.filter(val => !isNaN(val)).map(val => parseFloat(val));
        columnAnalysis.min = Math.min(...numericData);
        columnAnalysis.max = Math.max(...numericData);
        columnAnalysis.mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
      }

      analysis.columns.push(columnAnalysis);
    });

    return {
      success: true,
      data: analysis
    };

  } catch (error) {
    return {
      success: false,
      message: 'Error analyzing CSV: ' + error.message
    };
  }
};

// Detect data type of a column
const detectDataType = (values) => {
  if (values.length === 0) return 'unknown';

  const numericValues = values.filter(val => !isNaN(val) && val !== '').length;
  const totalValues = values.length;

  // If more than 80% are numeric, consider it numeric
  if (numericValues / totalValues > 0.8) {
    return 'number';
  }

  // Check for boolean-like values
  const booleanValues = values.filter(val => 
    ['true', 'false', '1', '0', 'yes', 'no'].includes(String(val).toLowerCase())
  ).length;

  if (booleanValues / totalValues > 0.8) {
    return 'boolean';
  }

  return 'string';
};

module.exports = {
  parseCSV,
  analyzeCSV,
  detectDataType
};