// src/components/predictions/YieldForecaster.jsx
import React from 'react';
import PropTypes from 'prop-types';

const YieldForecaster = ({ predictions, compact = false }) => {
  const { predictedYield, confidence, factors } = predictions;

  // Helper function to get yield category
  const getYieldCategory = (yieldValue) => {
    if (yieldValue >= 100) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (yieldValue >= 75) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (yieldValue >= 50) return { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'Below Average', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const yieldCategory = getYieldCategory(predictedYield);

  if (compact) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Yield Forecaster</h3>
          <p className="text-sm text-gray-600">Predicted harvest yield</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-block px-4 py-3 rounded-lg border ${yieldCategory.bg} ${yieldCategory.border}`}>
                <div className={`text-3xl font-bold ${yieldCategory.color}`}>
                  {predictedYield.toFixed(1)}g
                </div>
                <div className={`text-sm ${yieldCategory.color}`}>
                  {yieldCategory.label}
                </div>
              </div>
            </div>
            
            {confidence && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Prediction Confidence</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(confidence * 100)}%
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
        <h2 className="text-xl font-semibold text-gray-900">Yield Forecasting</h2>
        <p className="text-sm text-gray-600">
          AI-powered yield prediction based on plant characteristics and growth patterns
        </p>
      </div>

      <div className="card-content space-y-8">
        {/* Predicted Yield Display */}
        <div className="text-center">
          <div className={`inline-block px-8 py-6 rounded-xl border-2 ${yieldCategory.bg} ${yieldCategory.border}`}>
            <div className={`text-5xl font-bold mb-2 ${yieldCategory.color}`}>
              {predictedYield.toFixed(1)}g
            </div>
            <div className={`text-lg font-medium mb-1 ${yieldCategory.color}`}>
              Predicted Yield
            </div>
            <div className={`text-sm opacity-75 ${yieldCategory.color}`}>
              {yieldCategory.label} Expected
            </div>
          </div>
        </div>

        {/* Yield Range Visualization */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Yield Expectations</h3>
          <div className="space-y-4">
            {/* Yield range scale */}
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0g</span>
                <span>50g</span>
                <span>100g</span>
                <span>150g+</span>
              </div>
              
              <div className="h-6 bg-gradient-to-r from-red-300 via-yellow-300 via-blue-300 to-green-300 rounded-full relative">
                {/* Prediction marker */}
                <div 
                  className="absolute top-0 h-6 w-1 bg-purple-600 rounded-full"
                  style={{ left: `${Math.min(100, (predictedYield / 150) * 100)}%` }}
                />
                <div 
                  className="absolute -top-8 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded"
                  style={{ left: `${Math.min(100, (predictedYield / 150) * 100)}%` }}
                >
                  {predictedYield.toFixed(1)}g
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Poor</span>
                <span>Average</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Confidence indicator */}
            {confidence && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Prediction Confidence</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      confidence > 0.8 
                        ? 'bg-green-500' 
                        : confidence > 0.6 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {confidence > 0.8 && 'High confidence - reliable prediction based on strong data patterns'}
                  {confidence > 0.6 && confidence <= 0.8 && 'Medium confidence - good prediction with some uncertainty'}
                  {confidence <= 0.6 && 'Low confidence - prediction has significant uncertainty'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Yield Factors Analysis */}
        {factors && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Factors Affecting Yield</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plant Size */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">📏</div>
                  <div>
                    <div className="font-medium text-blue-900">Plant Size</div>
                    <div className="text-sm text-blue-700">{factors.size}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  Larger plants generally produce higher yields
                </div>
              </div>

              {/* Health Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">❤️</div>
                  <div>
                    <div className="font-medium text-green-900">Health Status</div>
                    <div className="text-sm text-green-700">{factors.health}</div>
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  Healthy plants maximize yield potential
                </div>
              </div>

              {/* Growth Stage */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">🌱</div>
                  <div>
                    <div className="font-medium text-purple-900">Growth Stage</div>
                    <div className="text-sm text-purple-700 capitalize">{factors.stage}</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600">
                  Current development phase impacts final yield
                </div>
              </div>

              {/* Strain Genetics */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">🧬</div>
                  <div>
                    <div className="font-medium text-yellow-900">Strain Genetics</div>
                    <div className="text-sm text-yellow-700">{factors.strain}</div>
                  </div>
                </div>
                <div className="text-xs text-yellow-600">
                  Genetic potential varies by strain type
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yield Optimization Tips */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Yield Optimization Tips</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="text-green-500 mr-2 mt-0.5">✓</div>
                <div className="text-sm text-gray-700">
                  <strong>Maximize Light Exposure:</strong> Ensure plants receive adequate lighting 
                  throughout the flowering phase for optimal bud development.
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-2 mt-0.5">✓</div>
                <div className="text-sm text-gray-700">
                  <strong>Optimize Nutrition:</strong> Provide appropriate nutrients for each growth 
                  stage, with increased phosphorus during flowering.
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-2 mt-0.5">✓</div>
                <div className="text-sm text-gray-700">
                  <strong>Training Techniques:</strong> Use LST, SCROG, or topping to increase 
                  canopy coverage and bud sites.
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-2 mt-0.5">✓</div>
                <div className="text-sm text-gray-700">
                  <strong>Environmental Control:</strong> Maintain optimal temperature (65-80°F) 
                  and humidity (40-60%) for maximum yield potential.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Model Details</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Model Type:</div>
                <div className="text-gray-900 font-medium">Polynomial Regression</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Input Features:</div>
                <div className="text-gray-900 font-medium">Size, Health, Stage, Genetics</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Training Data:</div>
                <div className="text-gray-900 font-medium">Historical Harvest Records</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Accuracy Range:</div>
                <div className="text-gray-900 font-medium">±15-25% typical variance</div>
              </div>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Yield predictions are estimates based on plant characteristics and historical data. 
                Actual yields may vary based on environmental conditions, cultivation practices, and genetics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

YieldForecaster.propTypes = {
  predictions: PropTypes.object.isRequired,
  compact: PropTypes.bool
};

export default YieldForecaster;
