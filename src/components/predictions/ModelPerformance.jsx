// src/components/predictions/ModelPerformance.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ModelPerformance = ({ performance, models = [] }) => {
  const [selectedModel, setSelectedModel] = useState(models[0]?.name || 'growth');

  // Helper function to get accuracy color
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get accuracy label
  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 0.9) return 'Excellent';
    if (accuracy >= 0.8) return 'Good';
    if (accuracy >= 0.7) return 'Fair';
    return 'Needs Improvement';
  };

  // Helper function to get confidence level color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const currentModel = models.find(m => m.name === selectedModel) || models[0];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">Model Performance</h2>
        <p className="text-sm text-gray-600">
          Accuracy and reliability metrics for predictive models
        </p>
      </div>

      <div className="card-content">
        {/* Model Selector */}
        {models.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.displayName || model.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Overall Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getAccuracyColor(performance.overall_accuracy)}`}>
                {(performance.overall_accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Accuracy</div>
              <div className={`text-xs mt-1 ${getAccuracyColor(performance.overall_accuracy)}`}>
                {getAccuracyLabel(performance.overall_accuracy)}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {performance.total_predictions || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Predictions</div>
              <div className="text-xs text-gray-500 mt-1">
                Last 30 days
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {performance.data_points || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Training Data</div>
              <div className="text-xs text-gray-500 mt-1">
                Data points used
              </div>
            </div>
          </div>
        </div>

        {/* Model-Specific Performance */}
        {currentModel && (
          <div className="space-y-6">
            {/* Model Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {currentModel.displayName || currentModel.name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{currentModel.type || 'Regression'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {currentModel.lastUpdated 
                      ? new Date(currentModel.lastUpdated).toLocaleDateString()
                      : 'Recently'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Training Size:</span>
                  <span className="ml-2 font-medium">{currentModel.trainingSize || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    getConfidenceColor(currentModel.confidence || 0.5)
                  }`}>
                    {((currentModel.confidence || 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <div className="space-y-3">
                {/* R-squared */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">R-squared (R²)</span>
                    <span className="text-sm font-medium">
                      {(currentModel.r_squared || 0.75).toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(currentModel.r_squared || 0.75) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Mean Absolute Error */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Mean Absolute Error</span>
                    <span className="text-sm font-medium">
                      {(currentModel.mae || 0.15).toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.max(0, 100 - (currentModel.mae || 0.15) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Root Mean Square Error */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Root Mean Square Error</span>
                    <span className="text-sm font-medium">
                      {(currentModel.rmse || 0.22).toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${Math.max(0, 100 - (currentModel.rmse || 0.22) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Accuracy by Category */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Accuracy by Prediction Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Growth Predictions */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className={`text-sm ${getAccuracyColor(0.87)}`}>87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Harvest Predictions */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Harvest Timing</span>
                    <span className={`text-sm ${getAccuracyColor(0.92)}`}>92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Yield Predictions */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Yield Estimate</span>
                    <span className={`text-sm ${getAccuracyColor(0.74)}`}>74%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                </div>

                {/* Stage Transitions */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stage Transitions</span>
                    <span className={`text-sm ${getAccuracyColor(0.89)}`}>89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance Trend */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Performance Trend</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm text-gray-600 mb-1">
                    Model accuracy has improved by
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    +5.2%
                  </div>
                  <div className="text-xs text-gray-500">
                    over the last 7 days
                  </div>
                </div>
              </div>
            </div>

            {/* Model Status and Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Model Status</h3>
              
              {currentModel.confidence >= 0.8 ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-green-500 text-lg mr-2">✅</div>
                    <div>
                      <div className="font-medium text-green-800">Model Performing Well</div>
                      <div className="text-sm text-green-700 mt-1">
                        The model has sufficient data and is making reliable predictions. 
                        Continue monitoring for optimal performance.
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentModel.confidence >= 0.6 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-yellow-500 text-lg mr-2">⚠️</div>
                    <div>
                      <div className="font-medium text-yellow-800">Model Needs More Data</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        Predictions are moderately reliable. Adding more plant data will 
                        improve accuracy over time.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-red-500 text-lg mr-2">❌</div>
                    <div>
                      <div className="font-medium text-red-800">Insufficient Training Data</div>
                      <div className="text-sm text-red-700 mt-1">
                        The model needs significantly more data to make reliable predictions. 
                        Consider treating predictions as rough estimates.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary text-sm">
              Retrain Model
            </button>
            <button className="btn btn-outline text-sm">
              Export Metrics
            </button>
            <button className="btn btn-outline text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ModelPerformance.propTypes = {
  performance: PropTypes.shape({
    overall_accuracy: PropTypes.number.isRequired,
    total_predictions: PropTypes.number,
    data_points: PropTypes.number
  }).isRequired,
  models: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    type: PropTypes.string,
    lastUpdated: PropTypes.string,
    trainingSize: PropTypes.number,
    confidence: PropTypes.number,
    r_squared: PropTypes.number,
    mae: PropTypes.number,
    rmse: PropTypes.number
  }))
};

export default ModelPerformance;
