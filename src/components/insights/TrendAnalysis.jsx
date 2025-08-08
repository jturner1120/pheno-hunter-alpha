// src/components/insights/TrendAnalysis.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TrendAnalysis = ({ trends, timeRange }) => {
  const [selectedMetric, setSelectedMetric] = useState('growth_rate');

  const metrics = [
    { key: 'growth_rate', label: 'Growth Rate', unit: 'cm/week', icon: '📈' },
    { key: 'environmental_stability', label: 'Environmental Stability', unit: 'score', icon: '🌡️' },
    { key: 'harvest_timing', label: 'Harvest Timing', unit: 'days', icon: '🌾' }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const currentTrend = trends[selectedMetric];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">Trend Analysis</h2>
        <p className="text-sm text-gray-600">
          Growth patterns and trends over time
        </p>
      </div>

      <div className="card-content">
        {/* Metric Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{metric.icon}</span>
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Trend Display */}
        {currentTrend && (
          <div className="space-y-6">
            {/* Trend Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {metrics.find(m => m.key === selectedMetric)?.label}
                </h3>
                <span className={`text-2xl ${getTrendColor(currentTrend.trend)}`}>
                  {getTrendIcon(currentTrend.trend)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Current Trend</div>
                  <div className={`text-lg font-semibold capitalize ${getTrendColor(currentTrend.trend)}`}>
                    {currentTrend.trend}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Change</div>
                  <div className={`text-lg font-semibold ${
                    currentTrend.percentage_change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentTrend.percentage_change > 0 ? '+' : ''}
                    {currentTrend.percentage_change}%
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Visualization */}
            {selectedMetric === 'growth_rate' && currentTrend.data && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Growth Rate Over Time</h4>
                <div className="space-y-3">
                  {currentTrend.data.map((point, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(point.value / 3) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {point.value} cm/week
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMetric === 'environmental_stability' && currentTrend.data && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Environmental Conditions</h4>
                <div className="space-y-4">
                  {/* Stability Score */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Stability Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {(currentTrend.stability_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${currentTrend.stability_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recent Environmental Data */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-gray-600">Avg Temperature</div>
                      <div className="font-semibold">
                        {(currentTrend.data.reduce((sum, d) => sum + d.temperature, 0) / currentTrend.data.length).toFixed(1)}°C
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-gray-600">Avg Humidity</div>
                      <div className="font-semibold">
                        {(currentTrend.data.reduce((sum, d) => sum + d.humidity, 0) / currentTrend.data.length).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-gray-600">Light Hours</div>
                      <div className="font-semibold">
                        {currentTrend.data[0]?.light_hours || 0}h
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'harvest_timing' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Harvest Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentTrend.average_days_to_harvest}
                    </div>
                    <div className="text-sm text-green-700">Average Days</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ±{currentTrend.variability}
                    </div>
                    <div className="text-sm text-blue-700">Day Variability</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(currentTrend.success_rate * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-700">Success Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Insights and Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Key Insights</h4>
              <div className="text-sm text-yellow-700">
                {selectedMetric === 'growth_rate' && (
                  <p>
                    Your plants are showing a {currentTrend.trend} growth trend with a {currentTrend.percentage_change}% change. 
                    {currentTrend.trend === 'increasing' 
                      ? ' This indicates optimal growing conditions - maintain current practices.'
                      : currentTrend.trend === 'decreasing'
                      ? ' Consider reviewing environmental conditions and nutrition schedule.'
                      : ' Consistent growth rate suggests stable growing conditions.'
                    }
                  </p>
                )}
                {selectedMetric === 'environmental_stability' && (
                  <p>
                    Environmental stability score of {(currentTrend.stability_score * 100).toFixed(0)}% indicates 
                    {currentTrend.stability_score > 0.8 
                      ? ' excellent environmental control. Your plants are thriving in consistent conditions.'
                      : currentTrend.stability_score > 0.6
                      ? ' good environmental control with room for improvement. Focus on reducing fluctuations.'
                      : ' unstable conditions that may stress your plants. Consider improving climate control.'
                    }
                  </p>
                )}
                {selectedMetric === 'harvest_timing' && (
                  <p>
                    With a {(currentTrend.success_rate * 100).toFixed(0)}% success rate and {currentTrend.variability} day variability, 
                    {currentTrend.success_rate > 0.9 
                      ? ' your harvest timing is excellent. You have mastered the optimal harvest window.'
                      : ' there is opportunity to improve harvest timing precision for better quality.'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TrendAnalysis.propTypes = {
  trends: PropTypes.object.isRequired,
  timeRange: PropTypes.string.isRequired
};

export default TrendAnalysis;
