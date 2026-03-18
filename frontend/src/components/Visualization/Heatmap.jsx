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
    if (isNaN(value)) return 'rgba(255, 255, 255, 0.2)'
    
    if (isCorr) {
      // Correlation: -1 to 1 (Indigo to Orange)
      const normalized = (value + 1) / 2 // 0 to 1
      if (normalized < 0.5) {
        // -1 to 0 (Indigo 500: 99, 102, 241)
        const intensity = 1 - (normalized * 2) 
        return `rgba(99, 102, 241, ${0.1 + (0.8 * intensity)})`
      } else {
        // 0 to 1 (Orange 500: 249, 115, 22)
        const intensity = (normalized - 0.5) * 2
        return `rgba(249, 115, 22, ${0.1 + (0.8 * intensity)})`
      }
    } else {
      // Regular data: 0 to 1 (Orange gradient)
      return `rgba(249, 115, 22, ${0.1 + (0.8 * value)})`
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
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <p className="text-slate-600">No data available for heatmap</p>
        </div>
      </div>
    )
  }

  const displayMatrix = heatmapData.matrix
  const displayRowLabels = heatmapData.rowLabels
  const displayColLabels = heatmapData.colLabels

  return (
    <div className="glass-panel p-4 sm:p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {isCorrelation ? 'Correlation Heatmap' : 'Expression Heatmap'}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <span>Low</span>
            <div className={`w-20 h-4 rounded border border-slate-200 ${
              isCorrelation 
                ? 'bg-gradient-to-r from-indigo-500 via-slate-100 to-orange-500' 
                : 'bg-gradient-to-r from-slate-100 to-orange-500'
            }`}></div>
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
                    className="px-1 py-1 text-xs font-medium text-slate-700 transform -rotate-45 origin-bottom-left"
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
                  <td className="px-2 py-1 text-xs font-medium text-slate-700 text-right bg-white sticky left-0 border-r border-slate-100">
                    <div className="w-20 truncate" title={displayRowLabels[rowIndex]}>
                      {displayRowLabels[rowIndex]}
                    </div>
                  </td>
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="w-8 h-6 border border-white/20 cursor-pointer hover:border-white/60 transition-colors relative z-10"
                      style={{ 
                        backgroundColor: getColor(value, isCorrelation),
                        backdropFilter: 'blur(4px)'
                      }}
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

      <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
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
