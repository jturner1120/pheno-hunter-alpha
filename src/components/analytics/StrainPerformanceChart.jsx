// src/components/analytics/StrainPerformanceChart.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const StrainPerformanceChart = ({ data, strainAnalytics }) => {
  const [selectedMetric, setSelectedMetric] = useState('averageYield');
  const [sortBy, setSortBy] = useState('averageYield');

  const metrics = [
    { key: 'averageYield', label: 'Average Yield (g)', color: '#10B981', format: (v) => `${v}g` },
    { key: 'successRate', label: 'Success Rate (%)', color: '#3B82F6', format: (v) => `${v}%` },
    { key: 'averageGrowthTime', label: 'Growth Time (days)', color: '#8B5CF6', format: (v) => `${v}d` },
    { key: 'plantsCount', label: 'Total Plants', color: '#F59E0B', format: (v) => v.toString() }
  ];

  // Sort data based on selected metric
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return bValue - aValue; // Descending order
    });
  }, [data, sortBy]);

  // Calculate chart dimensions
  const chartHeight = Math.max(400, sortedData.length * 50);
  const margin = { top: 20, right: 100, bottom: 60, left: 150 };
  const barHeight = 30;
  const barSpacing = 20;

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    if (sortedData.length === 0) return 100;
    return Math.max(...sortedData.map(d => d[selectedMetric] || 0));
  }, [sortedData, selectedMetric]);

  const selectedMetricConfig = metrics.find(m => m.key === selectedMetric);

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🌿</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Strain Data</h3>
        <p className="text-gray-600">
          Harvest some plants to see strain performance comparisons.
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
            Display Metric
          </label>
          <div className="flex flex-wrap gap-2">
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

        {/* Sort Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-patriot-blue focus:border-patriot-blue sm:text-sm"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900">
            Strain Performance: {selectedMetricConfig?.label}
          </h4>
          <p className="text-sm text-gray-600">
            Comparing {sortedData.length} strains by {selectedMetricConfig?.label.toLowerCase()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="space-y-4 min-w-full">
            {sortedData.map((strain, index) => {
              const value = strain[selectedMetric] || 0;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const detailedData = strainAnalytics?.[strain.strain];

              return (
                <div key={strain.strain} className="flex items-center space-x-4">
                  {/* Strain Name */}
                  <div className="w-32 flex-shrink-0 text-right">
                    <div className="font-medium text-gray-900 text-sm">
                      {strain.strain}
                    </div>
                    <div className="text-xs text-gray-500">
                      {strain.plantsCount} plants
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative">
                    <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(2, percentage)}%`,
                          backgroundColor: selectedMetricConfig?.color
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-sm font-medium text-gray-900">
                          {selectedMetricConfig?.format(value)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="w-24 flex-shrink-0 text-xs text-gray-500 text-right">
                    <div>Yield: {strain.averageYield}g</div>
                    <div>Success: {strain.successRate}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {sortedData.length}
            </div>
            <div className="text-sm text-gray-500">Strains</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {sortedData[0]?.[selectedMetric] ? selectedMetricConfig?.format(sortedData[0][selectedMetric]) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Best Performer</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {sortedData.length > 0 ? selectedMetricConfig?.format(
                sortedData.reduce((sum, s) => sum + (s[selectedMetric] || 0), 0) / sortedData.length
              ) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {sortedData.reduce((sum, s) => sum + s.plantsCount, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Plants</div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Detailed Strain Comparison</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harvested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((strain) => (
                <tr key={strain.strain} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {strain.strain}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {strain.plantsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {strain.harvestedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      strain.successRate >= 80 ? 'bg-green-100 text-green-800' :
                      strain.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {strain.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {strain.averageYield.toFixed(1)}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {strain.averageGrowthTime.toFixed(0)} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

StrainPerformanceChart.propTypes = {
  data: PropTypes.array.isRequired,
  strainAnalytics: PropTypes.object
};

export default StrainPerformanceChart;
