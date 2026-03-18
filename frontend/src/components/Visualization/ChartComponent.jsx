import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import CustomSelect from '../common/CustomSelect'

const D3Chart = ({ data, chartType, selectedColumns }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!data || !selectedColumns.length || !chartRef.current) return

    // Clear previous SVG
    d3.select(chartRef.current).selectAll("*").remove()

    const containerWidth = chartRef.current.clientWidth
    const containerHeight = chartRef.current.clientHeight || 400
    const margin = { top: 30, right: 30, bottom: 50, left: 60 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("overflow", "visible")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Prepare data
    const chartData = data.rows.slice(0, 50).map((row, i) => {
      const d = { sample: row[0] || `Sample ${i + 1}`, index: i }
      selectedColumns.forEach(col => {
        const colIdx = data.headers.indexOf(col)
        d[col] = typeof row[colIdx] === 'number' ? row[colIdx] : 0
      })
      return d
    })

    const allValues = chartData.flatMap(d => selectedColumns.map(col => d[col]))
    const yMax = d3.max(allValues) || 1
    const yMin = d3.min(allValues) || 0

    // Scales
    const xScale = d3.scalePoint()
      .domain(chartData.map(d => d.sample))
      .range([0, width])
      .padding(0.5)

    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yMin), yMax * 1.1])
      .range([height, 0])
      .nice()

    // Vibrant pastel/neon colors for light theme graphs
    const colors = ['#06b6d4', '#f43f5e', '#8b5cf6', '#10b981', '#f59e0b']
    const colorScale = d3.scaleOrdinal().domain(selectedColumns).range(colors)

    // Add Definitions for Gradients
    const defs = svg.append("defs")

    // Filter for glowing effect
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%")
      
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur")
      
    const feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "blur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    selectedColumns.forEach((col, i) => {
      // Area Gradient
      const areaGradient = defs.append("linearGradient")
        .attr("id", `area-gradient-${i}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%")
      areaGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(col)).attr("stop-opacity", 0.5)
      areaGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(col)).attr("stop-opacity", 0.0)

      // Bar Gradient
      const barGradient = defs.append("linearGradient")
        .attr("id", `bar-gradient-${i}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%")
      barGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(col)).attr("stop-opacity", 0.9)
      barGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(col)).attr("stop-opacity", 0.3)
    })

    // Add Grid Lines
    svg.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-dasharray", "4,4")

    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((_, i) => !(i % 5))))
      .attr("color", "#64748b")

    xAxis.selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("font-family", "Inter")

    svg.append("g")
      .call(d3.axisLeft(yScale))
      .attr("color", "#64748b")
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "Inter")

    // Remove axis spines
    svg.selectAll(".domain").remove()

    // Tooltip
    const tooltip = d3.select(chartRef.current)
      .append("div")
      .attr("class", "absolute hidden bg-white/95 backdrop-blur-md text-slate-800 p-3 rounded-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] pointer-events-none z-50 transition-all font-medium text-sm")

    // Draw paths based on type
    selectedColumns.forEach((col, index) => {
      if (chartType === 'line') {
        // Draw Area
        const area = d3.area()
          .x(d => xScale(d.sample))
          .y0(height)
          .y1(d => yScale(d[col]))
          .curve(d3.curveMonotoneX)

        const areaPath = svg.append("path")
          .datum(chartData)
          .attr("fill", `url(#area-gradient-${index})`)
          .attr("d", area)
          .style("opacity", 0)

        areaPath.transition()
          .duration(1500)
          .ease(d3.easeCubicOut)
          .style("opacity", 1)

        // Draw Line
        const line = d3.line()
          .x(d => xScale(d.sample))
          .y(d => yScale(d[col]))
          .curve(d3.curveMonotoneX)

        const path = svg.append("path")
          .datum(chartData)
          .attr("fill", "none")
          .attr("stroke", colorScale(col))
          .attr("stroke-width", 1.5)
          .attr("d", line)
          .style("filter", "url(#glow)")

        // Animation
        const totalLength = path.node().getTotalLength()
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1500)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)

      } else if (chartType === 'bar') {
        const xSubgroup = d3.scaleBand()
          .domain(selectedColumns)
          .range([0, xScale.step() * 0.8])
          .padding(0.1)

        svg.selectAll(".barsGroup")
          .data(chartData)
          .enter().append("g")
          .attr("transform", d => `translate(${xScale(d.sample) - xSubgroup.bandwidth() * selectedColumns.length / 2},0)`)
          .selectAll("rect")
          .data(d => [{ key: col, value: d[col] }])
          .enter().append("rect")
          .attr("x", d => xSubgroup(d.key))
          .attr("y", height)
          .attr("width", xSubgroup.bandwidth())
          .attr("height", 0)
          .attr("fill", `url(#bar-gradient-${index})`)
          .attr("rx", 4)
          .transition()
          .duration(1000)
          .ease(d3.easeElasticOut)
          .delay((d, i) => i * 10)
          .attr("y", d => yScale(d.value))
          .attr("height", d => height - yScale(d.value))
      }

      // Add points for scatter only (no dots on line chart)
      if (chartType === 'scatter') {
        svg.selectAll(`dot-${index}`)
          .data(chartData)
          .enter().append("circle")
          .attr("cx", d => xScale(d.sample))
          .attr("cy", d => yScale(d[col]))
          .attr("r", chartType === 'scatter' ? 6 : 4.5)
          .attr("fill", "#ffffff")
          .attr("stroke", colorScale(col))
          .attr("stroke-width", chartType === 'scatter' ? 3 : 2)
          .style("opacity", 0)
          .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
              .transition().duration(200)
              .attr("r", chartType === 'scatter' ? 8 : 6)
              .attr("stroke-width", chartType === 'scatter' ? 4 : 3)
              .style("filter", "url(#glow)")
              
            tooltip.style("display", "block")
              .html(`
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider">${col}</span>
                  <span class="text-sm text-slate-900 truncate max-w-[150px]">${d.sample}</span>
                  <span class="text-lg font-bold" style="color: ${colorScale(col)}">${d[col].toFixed(2)}</span>
                </div>
              `)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px")
          })
          .on("mouseout", (event) => {
            d3.select(event.currentTarget)
              .transition().duration(200)
              .attr("r", chartType === 'scatter' ? 6 : 4.5)
              .attr("stroke-width", chartType === 'scatter' ? 3 : 2)
              .style("filter", "none")
            tooltip.style("display", "none")
          })
          .transition()
          .delay((d, i) => i * 20 + 800)
          .style("opacity", 1)
      }
    })

    const handleResize = () => {}
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data, chartType, selectedColumns])

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} className="w-full h-full min-h-[300px]" />
    </div>
  )
}

const ChartComponent = ({ data }) => {
  const [chartType, setChartType] = useState('line')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [showColumnSelector, setShowColumnSelector] = useState(false)

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

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column].slice(0, 5) // Limit to 5 columns
    )
  }

  if (!data) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <p className="text-slate-600">No data available for visualization</p>
        </div>
      </div>
    )
  }

  const numericColumns = data.headers.slice(1).filter((header, index) => {
    const columnData = data.rows.map(row => row[index + 1])
    return columnData.some(val => typeof val === 'number' && !isNaN(val))
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-panel p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 sm:mb-0">D3.js Visualization</h3>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 sm:flex-none">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chart Type</label>
                <CustomSelect
                  value={chartType}
                  onChange={(val) => setChartType(val)}
                  options={[
                    { value: 'line', label: 'Line Chart' },
                    { value: 'bar', label: 'Bar Chart' },
                    { value: 'scatter', label: 'Scatter Plot' }
                  ]}
                  placeholder="Select Chart Type"
                />
              </div>
              
              {/* Mobile Column Selector Button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="btn-secondary w-full py-2"
                >
                  Select Columns ({selectedColumns.length})
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Column Selector */}
          {showColumnSelector && (
            <div className="sm:hidden border-t border-slate-200 pt-4">
              <h4 className="font-medium text-slate-800 mb-3">Select Columns (max 5)</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {numericColumns.map((column) => (
                  <label key={column} className="flex items-center text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column)}
                      onChange={() => handleColumnToggle(column)}
                      className="rounded border-slate-300 bg-slate-50 hover:bg-slate-100 text-primary-500 focus:ring-primary-500 mr-2"
                      disabled={!selectedColumns.includes(column) && selectedColumns.length >= 5}
                    />
                    <span className="truncate">{column}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* Chart */}
          <div className="lg:flex-1 w-full glass-card p-1">
            <D3Chart data={data} chartType={chartType} selectedColumns={selectedColumns} />
          </div>

          {/* Desktop Column Selector */}
          <div className="hidden sm:block lg:w-64 mt-6 lg:mt-0">
            <h4 className="font-semibold text-slate-800 mb-4 px-1">Select Variables</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto glass-card border border-white/60 bg-white/40 p-3 rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-slate-200">
              {numericColumns.map((column) => (
                <label key={column} className="flex items-center text-sm font-medium text-slate-700 cursor-pointer hover:bg-white/60 p-2 rounded-lg transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-primary-500 focus:ring-primary-500 focus:ring-offset-0 mr-3 transition-all"
                    disabled={!selectedColumns.includes(column) && selectedColumns.length >= 5}
                  />
                  <span className="truncate group-hover:text-primary-600 transition-colors">{column}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 px-1 leading-relaxed">
              Select up to 5 variables to visualize in the multi-dimensional chart above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartComponent
