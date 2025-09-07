import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js'
import { Line, Bar, Scatter } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
)

const ChartComponent = ({ data }) => {
  const [chartType, setChartType] = useState('line')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (data && data.headers && data.rows) {
      // Initialize with first few numeric columns
      const numericColumns = data.headers.slice(1, 4).filter((header, index) => {
        const columnData = data.rows.map(row => row[index + 1])
        return columnData.some(val => typeof val === 'number' && !isNaN(val))
      })
      setSelectedColumns(numericColumns)
    }
  }, [data])

  useEffect(() => {
    if (data && selectedColumns.length > 0) {
      generateChartData()
    }
  }, [data, selectedColumns, chartType])

  const generateChartData = () => {
    if (!data || !selectedColumns.length) return

    const labels = data.rows.slice(0, 50).map((row, index) => row[0] || `Sample ${index + 1}`)
    
    const datasets = selectedColumns.map((column, index) => {
      const columnIndex = data.headers.indexOf(column)
      const columnData = data.rows.slice(0, 50).map(row => {
        const val = row[columnIndex]
        return typeof val === 'number' ? val : 0
      })

      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]

      return {
        label: column,
        data: chartType === 'scatter' 
          ? columnData.map((val, i) => ({ x: i, y: val }))
          : columnData,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.8', '1'),
        borderWidth: 2,
        fill: chartType === 'line' ? false : true
      }
    })

    setChartData({
      labels: chartType === 'scatter' ? undefined : labels,
      datasets
    })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Dataset Visualization - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      },
    },
    scales: chartType === 'scatter' ? {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Sample Index'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        }
      }
    } : {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Expression Level'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Samples'
        }
      }
    }
  }

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column].slice(0, 5) // Limit to 5 columns
    )
  }

  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">No data available for visualization</p>
        </div>
      </div>
    )
  }

  const numericColumns = data.headers.slice(1).filter((header, index) => {
    const columnData = data.rows.map(row => row[index + 1])
    return columnData.some(val => typeof val === 'number' && !isNaN(val))
  })

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">Data Visualization</h3>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="input-field"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="chart-container">
              {chartData && (
                <>
                  {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
                  {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
                  {chartType === 'scatter' && <Scatter data={chartData} options={chartOptions} />}
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Select Columns</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {numericColumns.map((column) => (
                <label key={column} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={!selectedColumns.includes(column) && selectedColumns.length >= 5}
                  />
                  <span className="ml-2 text-sm text-gray-700">{column}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select up to 5 columns for visualization
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartComponent
