// src/components/analytics/ActivityTimelineChart.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const ActivityTimelineChart = ({ data, timelineAnalytics }) => {
  const [selectedView, setSelectedView] = useState('events');

  const viewOptions = [
    { key: 'events', label: 'Events', color: '#3B82F6' },
    { key: 'plants', label: 'Active Plants', color: '#10B981' }
  ];

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Calculate scales
  const xScale = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1, scale: () => 0 };
    
    return {
      scale: (index) => (index / Math.max(1, data.length - 1)) * innerWidth
    };
  }, [data.length, innerWidth]);

  const yScale = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 10, scale: () => 0 };
    
    const values = data.map(d => d[selectedView]);
    const maxValue = Math.max(...values);
    const padding = maxValue * 0.1;
    
    return {
      min: 0,
      max: maxValue + padding,
      scale: (value) => innerHeight - ((value / (maxValue + padding)) * innerHeight)
    };
  }, [data, selectedView, innerHeight]);

  // Generate path for area chart
  const areaPath = useMemo(() => {
    if (data.length === 0) return '';
    
    const points = data.map((d, index) => 
      `${xScale.scale(index)},${yScale.scale(d[selectedView])}`
    );
    
    const topPath = `M 0,${innerHeight} L ${points.join(' L ')} L ${innerWidth},${innerHeight} Z`;
    return topPath;
  }, [data, xScale, yScale, selectedView, innerHeight, innerWidth]);

  // Generate line path
  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    
    const points = data.map((d, index) => 
      `${xScale.scale(index)},${yScale.scale(d[selectedView])}`
    );
    
    return `M ${points.join(' L ')}`;
  }, [data, xScale, yScale, selectedView]);

  // Format week label
  const formatWeek = (weekStr) => {
    const [year, week] = weekStr.split('-W');
    return `Week ${week}`;
  };

  // Generate x-axis ticks
  const xTicks = useMemo(() => {
    if (data.length === 0) return [];
    
    const tickCount = Math.min(6, data.length);
    const step = Math.max(1, Math.floor(data.length / tickCount));
    
    return data
      .filter((_, index) => index % step === 0 || index === data.length - 1)
      .map((d, arrayIndex) => {
        const originalIndex = data.findIndex(item => item.week === d.week);
        return {
          week: d.week,
          x: xScale.scale(originalIndex),
          label: formatWeek(d.week)
        };
      });
  }, [data, xScale]);

  // Generate y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const step = yScale.max / (tickCount - 1);
    
    return Array.from({ length: tickCount }, (_, i) => {
      const value = step * i;
      return {
        value: Math.round(value),
        y: yScale.scale(value)
      };
    });
  }, [yScale]);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Data</h3>
        <p className="text-gray-600">
          Start tracking plant activities to see your activity patterns over time.
        </p>
      </div>
    );
  }

  const selectedViewConfig = viewOptions.find(v => v.key === selectedView);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View
          </label>
          <div className="flex space-x-2">
            {viewOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setSelectedView(option.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === option.key
                    ? 'bg-patriot-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            Weekly Activity: {selectedViewConfig?.label}
          </h4>
          <p className="text-sm text-gray-600">
            {selectedView === 'events' ? 'Total events per week' : 'Number of active plants per week'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="min-w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="activityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={selectedViewConfig?.color} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={selectedViewConfig?.color} stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            <rect width={innerWidth} height={innerHeight} x={margin.left} y={margin.top} fill="url(#activityGrid)" />

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

            {/* Area */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <path
                d={areaPath}
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={selectedViewConfig?.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.map((d, index) => (
                <circle
                  key={index}
                  cx={xScale.scale(index)}
                  cy={yScale.scale(d[selectedView])}
                  r="4"
                  fill={selectedViewConfig?.color}
                  stroke="white"
                  strokeWidth="2"
                >
                  <title>
                    {formatWeek(d.week)}: {d[selectedView]} {selectedView}
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
              Time Period
            </text>
            <text
              x={20}
              y={margin.top + innerHeight / 2}
              textAnchor="middle"
              fontSize="14"
              fill="#4b5563"
              transform={`rotate(-90, 20, ${margin.top + innerHeight / 2})`}
            >
              {selectedViewConfig?.label}
            </text>
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-900">
              {data.length}
            </div>
            <div className="text-gray-500">Weeks</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">
              {Math.max(...data.map(d => d[selectedView]))}
            </div>
            <div className="text-gray-500">Peak {selectedView}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">
              {(data.reduce((sum, d) => sum + d[selectedView], 0) / data.length).toFixed(1)}
            </div>
            <div className="text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-purple-600">
              {data.reduce((sum, d) => sum + d[selectedView], 0)}
            </div>
            <div className="text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      {timelineAnalytics && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {timelineAnalytics.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
              <div className="text-xs text-gray-500 mt-1">
                Across {timelineAnalytics.activePeriods} weeks
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {timelineAnalytics.averageWeeklyActivity.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Weekly Activity</div>
              <div className="text-xs text-gray-500 mt-1">
                Events per week
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {timelineAnalytics.activePeriods}
              </div>
              <div className="text-sm text-gray-600">Active Periods</div>
              <div className="text-xs text-gray-500 mt-1">
                Weeks with activity
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ActivityTimelineChart.propTypes = {
  data: PropTypes.array.isRequired,
  timelineAnalytics: PropTypes.object
};

export default ActivityTimelineChart;
