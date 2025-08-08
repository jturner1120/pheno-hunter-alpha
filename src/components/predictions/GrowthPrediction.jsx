// src/components/predictions/GrowthPrediction.jsx
import React from 'react';
import PropTypes from 'prop-types';

const GrowthPrediction = ({ predictions, compact = false }) => {
  const { next7Days, next14Days, next30Days, growthRates } = predictions;

  if (compact) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Growth Prediction</h3>
          <p className="text-sm text-gray-600">AI-powered growth forecasting</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {next7Days && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next 7 days:</span>
                <div className="text-right">
                  {next7Days.height && (
                    <div className="text-sm font-medium">
                      Height: {next7Days.height.toFixed(1)}cm
                    </div>
                  )}
                  {next7Days.width && (
                    <div className="text-sm text-gray-600">
                      Width: {next7Days.width.toFixed(1)}cm
                    </div>
                  )}
                </div>
              </div>
            )}
            {next7Days?.confidence && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Confidence</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${next7Days.confidence * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(next7Days.confidence * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">Growth Prediction Analysis</h2>
        <p className="text-sm text-gray-600">
          Predicted growth based on historical patterns and current trends
        </p>
      </div>

      <div className="card-content space-y-8">
        {/* Growth Rate Summary */}
        {growthRates && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Growth Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {growthRates.heightPerDay !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📏</div>
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Height Growth Rate</div>
                      <div className="text-lg font-bold text-blue-900">
                        {growthRates.heightPerDay.toFixed(2)} cm/day
                      </div>
                      <div className="text-xs text-blue-700">
                        {(growthRates.heightPerDay * 7).toFixed(1)} cm/week
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {growthRates.widthPerDay !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">↔️</div>
                    <div>
                      <div className="text-sm text-green-600 font-medium">Width Growth Rate</div>
                      <div className="text-lg font-bold text-green-900">
                        {growthRates.widthPerDay.toFixed(2)} cm/day
                      </div>
                      <div className="text-xs text-green-700">
                        {(growthRates.widthPerDay * 7).toFixed(1)} cm/week
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prediction Timeline */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Predictions</h3>
          <div className="space-y-4">
            {/* 7-day prediction */}
            {next7Days && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">7 Days From Now</h4>
                  {next7Days.confidence && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${next7Days.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(next7Days.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {next7Days.height && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Height</div>
                      <div className="text-xl font-bold text-blue-600">
                        {next7Days.height.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {next7Days.width && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Width</div>
                      <div className="text-xl font-bold text-green-600">
                        {next7Days.width.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 14-day prediction */}
            {next14Days && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">14 Days From Now</h4>
                  {next14Days.confidence && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${next14Days.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(next14Days.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {next14Days.height && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Height</div>
                      <div className="text-xl font-bold text-blue-600">
                        {next14Days.height.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {next14Days.width && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Width</div>
                      <div className="text-xl font-bold text-green-600">
                        {next14Days.width.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 30-day prediction */}
            {next30Days && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">30 Days From Now</h4>
                  {next30Days.confidence && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${next30Days.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(next30Days.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {next30Days.height && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Height</div>
                      <div className="text-xl font-bold text-blue-600">
                        {next30Days.height.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {next30Days.width && (
                    <div>
                      <div className="text-sm text-gray-600">Predicted Width</div>
                      <div className="text-xl font-bold text-green-600">
                        {next30Days.width.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Growth Analysis */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Analysis</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              {growthRates?.heightPerDay !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Growth Rate Assessment:</span>
                  <span className={`text-sm font-medium ${
                    growthRates.heightPerDay > 2 
                      ? 'text-green-600' 
                      : growthRates.heightPerDay > 1 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {growthRates.heightPerDay > 2 
                      ? 'Excellent' 
                      : growthRates.heightPerDay > 1 
                      ? 'Good' 
                      : 'Slow'}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Prediction Method:</span>
                <span className="text-sm text-gray-900">Linear Regression</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Points Used:</span>
                <span className="text-sm text-gray-900">Historical Growth Measurements</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Predictions are based on historical growth patterns and may vary based on 
                  environmental conditions, nutrition, and plant genetics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

GrowthPrediction.propTypes = {
  predictions: PropTypes.object.isRequired,
  compact: PropTypes.bool
};

export default GrowthPrediction;
