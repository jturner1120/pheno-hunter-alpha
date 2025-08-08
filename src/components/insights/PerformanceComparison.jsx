// src/components/insights/PerformanceComparison.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PerformanceComparison = ({ comparisons, timeRange }) => {
  const [comparisonType, setComparisonType] = useState('strain_performance');

  const comparisonTypes = [
    { key: 'strain_performance', label: 'Strain Performance', icon: '🧬' },
    { key: 'environmental_impact', label: 'Environmental Impact', icon: '🌡️' }
  ];

  const getPerformanceColor = (value, max, type = 'positive') => {
    const percentage = (value / max) * 100;
    if (type === 'positive') {
      if (percentage >= 80) return 'text-green-600 bg-green-50';
      if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    } else {
      if (percentage <= 20) return 'text-green-600 bg-green-50';
      if (percentage <= 40) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    }
  };

  const getBarColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">Performance Comparison</h2>
        <p className="text-sm text-gray-600">
          Compare performance across strains and conditions
        </p>
      </div>

      <div className="card-content">
        {/* Comparison Type Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {comparisonTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setComparisonType(type.key)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  comparisonType === type.key
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Strain Performance Comparison */}
        {comparisonType === 'strain_performance' && comparisons.strain_performance && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Strain Performance Metrics</h3>
              
              {/* Performance Table */}
              <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strain
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Yield (g)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisons.strain_performance.map((strain, index) => {
                      const maxYield = Math.max(...comparisons.strain_performance.map(s => s.avg_yield));
                      const maxGrowthRate = Math.max(...comparisons.strain_performance.map(s => s.avg_growth_rate));
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{strain.strain}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-1 mr-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getBarColor(strain.avg_yield, maxYield)}`}
                                    style={{ width: `${(strain.avg_yield / maxYield) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {strain.avg_yield}g
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-1 mr-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getBarColor(strain.avg_growth_rate, maxGrowthRate)}`}
                                    style={{ width: `${(strain.avg_growth_rate / maxGrowthRate) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {strain.avg_growth_rate}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getPerformanceColor(strain.harvest_success * 100, 100)
                            }`}>
                              {(strain.harvest_success * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Performer Highlight */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="text-green-500 text-lg mr-3">🏆</div>
                <div>
                  <h4 className="font-medium text-green-800">Top Performer</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {comparisons.strain_performance.reduce((best, current) => 
                      current.avg_yield > best.avg_yield ? current : best
                    ).strain} leads with the highest average yield of{' '}
                    {Math.max(...comparisons.strain_performance.map(s => s.avg_yield))}g per plant.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {(comparisons.strain_performance.reduce((sum, s) => sum + s.avg_yield, 0) / comparisons.strain_performance.length).toFixed(0)}g
                </div>
                <div className="text-sm text-gray-600">Average Yield</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {(comparisons.strain_performance.reduce((sum, s) => sum + s.avg_growth_rate, 0) / comparisons.strain_performance.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Growth Rate</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {((comparisons.strain_performance.reduce((sum, s) => sum + s.harvest_success, 0) / comparisons.strain_performance.length) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Average Success Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Environmental Impact Comparison */}
        {comparisonType === 'environmental_impact' && comparisons.environmental_impact && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Environmental Performance</h3>
              
              {/* Temperature Analysis */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Temperature Optimization</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Optimal Range</span>
                    <span className="text-sm font-medium">
                      {comparisons.environmental_impact.optimal_temperature.min}°C - {comparisons.environmental_impact.optimal_temperature.max}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Average</span>
                    <span className={`text-sm font-medium ${
                      comparisons.environmental_impact.current_avg >= comparisons.environmental_impact.optimal_temperature.min &&
                      comparisons.environmental_impact.current_avg <= comparisons.environmental_impact.optimal_temperature.max
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {comparisons.environmental_impact.optimal_temperature.current_avg}°C
                    </span>
                  </div>
                  
                  {/* Temperature Range Visualization */}
                  <div className="relative mt-3">
                    <div className="w-full h-4 bg-gray-200 rounded-full relative">
                      {/* Optimal range */}
                      <div 
                        className="absolute h-4 bg-green-200 rounded-full"
                        style={{ 
                          left: `${((comparisons.environmental_impact.optimal_temperature.min - 20) / 10) * 100}%`,
                          width: `${((comparisons.environmental_impact.optimal_temperature.max - comparisons.environmental_impact.optimal_temperature.min) / 10) * 100}%`
                        }}
                      ></div>
                      {/* Current temperature marker */}
                      <div 
                        className="absolute w-2 h-6 bg-blue-600 rounded-full -top-1"
                        style={{ 
                          left: `${((comparisons.environmental_impact.optimal_temperature.current_avg - 20) / 10) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>20°C</span>
                      <span>25°C</span>
                      <span>30°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Humidity Analysis */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Humidity Control</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Optimal Range</span>
                    <span className="text-sm font-medium">
                      {comparisons.environmental_impact.optimal_humidity.min}% - {comparisons.environmental_impact.optimal_humidity.max}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Average</span>
                    <span className={`text-sm font-medium ${
                      comparisons.environmental_impact.current_avg >= comparisons.environmental_impact.optimal_humidity.min &&
                      comparisons.environmental_impact.current_avg <= comparisons.environmental_impact.optimal_humidity.max
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {comparisons.environmental_impact.optimal_humidity.current_avg}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Light Efficiency */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Light Efficiency</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Current Efficiency</span>
                    <span className={`text-lg font-semibold ${
                      comparisons.environmental_impact.light_efficiency >= 0.8 ? 'text-green-600' :
                      comparisons.environmental_impact.light_efficiency >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(comparisons.environmental_impact.light_efficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        comparisons.environmental_impact.light_efficiency >= 0.8 ? 'bg-green-500' :
                        comparisons.environmental_impact.light_efficiency >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${comparisons.environmental_impact.light_efficiency * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {comparisons.environmental_impact.light_efficiency >= 0.8 
                      ? 'Excellent light utilization. Your plants are receiving optimal light energy.'
                      : comparisons.environmental_impact.light_efficiency >= 0.6
                      ? 'Good light efficiency with room for improvement. Consider optimizing light positioning.'
                      : 'Light efficiency could be improved. Review light setup and plant positioning.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PerformanceComparison.propTypes = {
  comparisons: PropTypes.object.isRequired,
  timeRange: PropTypes.string.isRequired
};

export default PerformanceComparison;
