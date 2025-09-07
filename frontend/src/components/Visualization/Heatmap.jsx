import React, { useState, useEffect } from 'react'

const Heatmap = ({ data, isCorrelation = false }) => {
  const [heatmapData, setHeatmapData] = useState(null)
  const [selectedSamples, setSelectedSamples] = useState([])
  const [selectedGenes, setSelectedGenes] = useState([])

  useEffect(() => {
    if (data) {
      generateHeatmapData()
    }
  }, [data, isCorrelation])

  const generateHeatmapData = () => {
    if (isCorrelation && typeof data === 'object') {
      // Handle correlation matrix data
      const genes = Object.keys(data)
      const matrix = genes.map(gene1 => 
        genes.map(gene2 => data[gene1]?.[gene2] || 0)
      )
      
      setHeatmapData({
        matrix,
        rowLabels: genes.slice(0, 20), // Limit for display
        colLabels: genes.slice(0, 20),
        isCorrelation: true
      })
      return
    }

    if (data?.headers && data?.rows) {
      // Handle regular dataset
      const numericColumns = data.headers.slice(1).filter((header, index) => {
        const columnData = data.rows.map(row => row[index + 1])
        return columnData.some(val => typeof val === 'number' && !isNaN(val))
      })

      const samples = data.rows.slice(0, 20).map(row => row[0] || 'Sample')
      const genes = numericColumns.slice(0, 30)
      
      const matrix = samples.map((_, sampleIndex) => 
        genes.map(gene => {
          const geneIndex = data.headers.indexOf(gene)
          const value = data.rows[sampleIndex]?.[geneIndex]
          return typeof value === 'number' ? value : 0
        })
      )

      // Normalize data for better visualization
      const flatValues = matrix.flat().filter(val => !isNaN(val))
      const minVal = Math.min(...flatValues)
      const maxVal = Math.max(...flatValues)
      
      const normalizedMatrix = matrix.map(row =>
        row.map(val => (val - minVal) / (maxVal - minVal))
      )

      setHeatmapData({
        matrix: normalizedMatrix,
        rowLabels: samples,
        colLabels: genes,
        isCorrelation: false,
        minVal,
        maxVal
      })

      setSelectedSamples(samples.slice(0, 10))
      setSelectedGenes(genes.slice(0, 15))
    }
  }

  const getColor = (value, isCorr = false) => {
    if (isNaN(value)) return 'rgb(240, 240, 240)'
    
    if (isCorr) {
      // Correlation: -1 to 1, blue (negative) to red (positive)
      const normalized = (value + 1) / 2 // Convert -1,1 to 0,1
      const red = Math.round(255 * normalized)
      const blue = Math.round(255 * (1 - normalized))
      return `rgb(${red}, 100, ${blue})`
    } else {
      // Regular data: 0 to 1, white to blue
      const intensity = Math.round(255 * (1 - value))
      return `rgb(${intensity}, ${intensity}, 255)`
    }
  }

  const getCellTitle = (value, rowIndex, colIndex) => {
    if (!heatmapData) return ''
    
    const rowLabel = heatmapData.rowLabels[rowIndex]
    const colLabel = heatmapData.colLabels[colIndex]
    
    if (isCorrelation) {
      return `${rowLabel} vs ${colLabel}: ${value.toFixed(3)}`
    } else {
      const originalValue = ((value * (heatmapData.maxVal - heatmapData.minVal)) + heatmapData.minVal).toFixed(2)
      return `${rowLabel} - ${colLabel}: ${originalValue}`
    }
  }

  if (!heatmapData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">No data available for heatmap</p>
        </div>
      </div>
    )
  }

  const displayMatrix = heatmapData.matrix
  const displayRowLabels = heatmapData.rowLabels
  const displayColLabels = heatmapData.colLabels

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isCorrelation ? 'Correlation Heatmap' : 'Expression Heatmap'}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <span>Low</span>
            <div className="w-20 h-4 bg-gradient-to-r from-white to-blue-500"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-96">
        <div className="inline-block">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-24"></th>
                {displayColLabels.map((label, index) => (
                  <th
                    key={index}
                    className="px-1 py-1 text-xs font-medium text-gray-700 transform -rotate-45 origin-bottom-left"
                    style={{ minWidth: '40px', height: '80px' }}
                  >
                    <div className="w-12 truncate" title={label}>
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayMatrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-2 py-1 text-xs font-medium text-gray-700 text-right bg-gray-50 sticky left-0">
                    <div className="w-20 truncate" title={displayRowLabels[rowIndex]}>
                      {displayRowLabels[rowIndex]}
                    </div>
                  </td>
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="w-8 h-6 border border-gray-200 cursor-pointer hover:border-gray-400"
                      style={{ backgroundColor: getColor(value, isCorrelation) }}
                      title={getCellTitle(value, rowIndex, colIndex)}
                    >
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Showing {displayMatrix.length} × {displayColLabels.length} matrix
          {!isCorrelation && ' (normalized values)'}
        </p>
        {isCorrelation && (
          <p className="mt-1">
            Correlation values range from -1 (negative correlation) to +1 (positive correlation)
          </p>
        )}
      </div>
    </div>
  )
}

export default Heatmap
