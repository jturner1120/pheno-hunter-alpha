// src/components/analytics/GrowthChart.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const GrowthChart = ({ data, selectedPlants, plants }) => {
  const [selectedMetric, setSelectedMetric] = useState('height');
  const [selectedPlantForChart, setSelectedPlantForChart] = useState('all');

  const metrics = [
    { key: 'height', label: 'Height (cm)', color: '#10B981' },
    { key: 'width', label: 'Width (cm)', color: '#3B82F6' },
    { key: 'nodes', label: 'Node Count', color: '#8B5CF6' }
  ];

  // Filter and group data
  const chartData = useMemo(() => {
    let filteredData = data;

    // Filter by selected plants
    if (selectedPlants.length > 0) {
      filteredData = data.filter(d => selectedPlants.includes(d.plantId));
    }

    // Filter by specific plant if selected
    if (selectedPlantForChart !== 'all') {
      filteredData = filteredData.filter(d => d.plantId === selectedPlantForChart);
    }

    // Group by date and calculate averages if showing all plants
    if (selectedPlantForChart === 'all') {
      const groupedByDate = filteredData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = [];
        }
        acc[item.date].push(item);
        return acc;
      }, {});

      return Object.entries(groupedByDate)
        .map(([date, items]) => ({
          date,
          height: items.reduce((sum, item) => sum + item.height, 0) / items.length,
          width: items.reduce((sum, item) => sum + item.width, 0) / items.length,
          nodes: items.reduce((sum, item) => sum + item.nodes, 0) / items.length,
          plantCount: items.length
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, selectedPlants, selectedPlantForChart]);

  // Get unique plants for filter
  const availablePlants = useMemo(() => {
    const plantIds = selectedPlants.length > 0 
      ? selectedPlants 
      : [...new Set(data.map(d => d.plantId))];
    
    return plantIds.map(id => plants.find(p => p.id === id)).filter(Boolean);
  }, [selectedPlants, data, plants]);

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 400;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Calculate scales
  const xScale = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 1, scale: () => 0 };
    
    const dates = chartData.map(d => new Date(d.date));
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    return {
      min: minDate,
      max: maxDate,
      scale: (date) => {
        const dateValue = new Date(date).getTime();
        return ((dateValue - minDate) / (maxDate - minDate)) * innerWidth;
      }
    };
  }, [chartData, innerWidth]);

  const yScale = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100, scale: () => 0 };
    
    const values = chartData.map(d => d[selectedMetric]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.1 || 10;
    
    return {
      min: Math.max(0, minValue - padding),
      max: maxValue + padding,
      scale: (value) => {
        return innerHeight - ((value - (minValue - padding)) / (maxValue - minValue + 2 * padding)) * innerHeight;
      }
    };
  }, [chartData, selectedMetric, innerHeight]);

  // Generate path for line chart
  const linePath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const points = chartData.map(d => 
      `${xScale.scale(d.date)},${yScale.scale(d[selectedMetric])}`
    );
    
    return `M ${points.join(' L ')}`;
  }, [chartData, xScale, yScale, selectedMetric]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate x-axis ticks
  const xTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const tickCount = Math.min(6, chartData.length);
    const step = Math.max(1, Math.floor(chartData.length / tickCount));
    
    return chartData
      .filter((_, index) => index % step === 0 || index === chartData.length - 1)
      .map(d => ({
        date: d.date,
        x: xScale.scale(d.date),
        label: formatDate(d.date)
      }));
  }, [chartData, xScale]);

  // Generate y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const step = (yScale.max - yScale.min) / (tickCount - 1);
    
    return Array.from({ length: tickCount }, (_, i) => {
      const value = yScale.min + step * i;
      return {
        value: Math.round(value * 10) / 10,
        y: yScale.scale(value)
      };
    });
  }, [yScale]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📈</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Growth Data</h3>
        <p className="text-gray-600">
          Start recording plant measurements to see growth trends over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Metric Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metric
          </label>
          <div className="flex space-x-2">
            {metrics.map(metric => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-patriot-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Selector */}
        {availablePlants.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plant
            </label>
            <select
              value={selectedPlantForChart}
              onChange={(e) => setSelectedPlantForChart(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-patriot-blue focus:border-patriot-blue sm:text-sm"
            >
              <option value="all">All Plants (Average)</option>
              {availablePlants.map(plant => (
                <option key={plant.id} value={plant.id}>
                  {plant.name} ({plant.strain})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            {metrics.find(m => m.key === selectedMetric)?.label} Over Time
          </h4>
          <p className="text-sm text-gray-600">
            {selectedPlantForChart === 'all' 
              ? `Average across ${availablePlants.length} plants`
              : availablePlants.find(p => p.id === selectedPlantForChart)?.name || 'Individual plant'
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="min-w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={innerWidth} height={innerHeight} x={margin.left} y={margin.top} fill="url(#grid)" />

            {/* Y-axis */}
            <g>
              {yTicks.map((tick, index) => (
                <g key={index}>
                  <line
                    x1={margin.left}
                    y1={margin.top + tick.y}
                    x2={margin.left + innerWidth}
                    y2={margin.top + tick.y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={margin.top + tick.y + 5}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}
            </g>

            {/* X-axis */}
            <g>
              {xTicks.map((tick, index) => (
                <g key={index}>
                  <line
                    x1={margin.left + tick.x}
                    y1={margin.top}
                    x2={margin.left + tick.x}
                    y2={margin.top + innerHeight}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left + tick.x}
                    y={margin.top + innerHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}
            </g>

            {/* Line */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <path
                d={linePath}
                fill="none"
                stroke={metrics.find(m => m.key === selectedMetric)?.color || '#3B82F6'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((d, index) => (
                <circle
                  key={index}
                  cx={xScale.scale(d.date)}
                  cy={yScale.scale(d[selectedMetric])}
                  r="4"
                  fill={metrics.find(m => m.key === selectedMetric)?.color || '#3B82F6'}
                  stroke="white"
                  strokeWidth="2"
                >
                  <title>
                    {formatDate(d.date)}: {d[selectedMetric]} {metrics.find(m => m.key === selectedMetric)?.label.match(/\(([^)]+)\)/)?.[1] || ''}
                  </title>
                </circle>
              ))}
            </g>

            {/* Axis labels */}
            <text
              x={margin.left + innerWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="14"
              fill="#4b5563"
            >
              Date
            </text>
            <text
              x={20}
              y={margin.top + innerHeight / 2}
              textAnchor="middle"
              fontSize="14"
              fill="#4b5563"
              transform={`rotate(-90, 20, ${margin.top + innerHeight / 2})`}
            >
              {metrics.find(m => m.key === selectedMetric)?.label}
            </text>
          </svg>
        </div>

        {/* Legend/Stats */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div>
            {chartData.length} data points
            {selectedPlantForChart === 'all' && chartData[0]?.plantCount && 
              ` (averaging ${chartData[0].plantCount} plants)`
            }
          </div>
          <div>
            Range: {yScale.min.toFixed(1)} - {yScale.max.toFixed(1)} {metrics.find(m => m.key === selectedMetric)?.label.match(/\(([^)]+)\)/)?.[1] || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

GrowthChart.propTypes = {
  data: PropTypes.array.isRequired,
  selectedPlants: PropTypes.array.isRequired,
  plants: PropTypes.array.isRequired
};

export default GrowthChart;
