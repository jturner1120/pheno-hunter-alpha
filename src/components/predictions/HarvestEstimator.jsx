// src/components/predictions/HarvestEstimator.jsx
import React from 'react';
import PropTypes from 'prop-types';

const HarvestEstimator = ({ predictions, compact = false }) => {
  const { harvestDate, daysRemaining, confidence, currentStage, stageProgress } = predictions;

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get urgency color
  const getUrgencyColor = (days) => {
    if (days <= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 14) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (days <= 30) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Helper function to get stage emoji
  const getStageEmoji = (stage) => {
    const stageEmojis = {
      'seedling': '🌱',
      'vegetative': '🌿',
      'flowering': '🌸',
      'harvest': '🌾'
    };
    return stageEmojis[stage] || '🌱';
  };

  if (compact) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Harvest Estimator</h3>
          <p className="text-sm text-gray-600">Predicted harvest timing</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-lg border ${getUrgencyColor(daysRemaining)}`}>
                <div className="text-2xl font-bold">
                  {daysRemaining} Days
                </div>
                <div className="text-sm">Until Harvest</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <div>Expected: {formatDate(harvestDate)}</div>
              {confidence && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Confidence</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
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
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">Harvest Estimation</h2>
        <p className="text-sm text-gray-600">
          AI-powered harvest timing prediction based on growth stage patterns
        </p>
      </div>

      <div className="card-content space-y-8">
        {/* Harvest Countdown */}
        <div className="text-center">
          <div className={`inline-block px-8 py-6 rounded-xl border-2 ${getUrgencyColor(daysRemaining)}`}>
            <div className="text-4xl font-bold mb-2">
              {daysRemaining}
            </div>
            <div className="text-lg font-medium mb-1">
              Days Until Harvest
            </div>
            <div className="text-sm opacity-75">
              {formatDate(harvestDate)}
            </div>
          </div>
        </div>

        {/* Current Stage Progress */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Stage Progress</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-3">{getStageEmoji(currentStage)}</div>
                <div>
                  <div className="text-lg font-medium text-gray-900 capitalize">
                    {currentStage} Stage
                  </div>
                  <div className="text-sm text-gray-600">
                    Current growth phase
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-patriot-blue">
                  {Math.round(stageProgress)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-patriot-blue h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, stageProgress)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Stage Start</span>
              <span>Stage Complete</span>
            </div>
          </div>
        </div>

        {/* Confidence Analysis */}
        {confidence && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Confidence</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Confidence</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
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
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">Confidence Level:</div>
                  {confidence > 0.8 && (
                    <div className="text-green-700">
                      <strong>High Confidence:</strong> Prediction is based on robust historical data 
                      and current growth patterns align well with expected trajectories.
                    </div>
                  )}
                  {confidence > 0.6 && confidence <= 0.8 && (
                    <div className="text-yellow-700">
                      <strong>Medium Confidence:</strong> Prediction is reasonable but may vary 
                      based on environmental factors or plant-specific variations.
                    </div>
                  )}
                  {confidence <= 0.6 && (
                    <div className="text-red-700">
                      <strong>Low Confidence:</strong> Limited historical data or unusual growth 
                      patterns detected. Monitor closely and expect potential variations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Harvest Preparation Timeline */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Harvest Preparation Timeline</h3>
          <div className="space-y-3">
            {/* Preparation milestones based on days remaining */}
            {daysRemaining > 14 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  14
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900">Start Harvest Preparation</div>
                  <div className="text-sm text-blue-700">
                    Begin monitoring trichomes and prepare harvest equipment
                  </div>
                </div>
              </div>
            )}
            
            {daysRemaining > 7 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  7
                </div>
                <div className="flex-1">
                  <div className="font-medium text-yellow-900">Final Week Preparation</div>
                  <div className="text-sm text-yellow-700">
                    Daily trichome checks, flush nutrients, prepare drying area
                  </div>
                </div>
              </div>
            )}
            
            <div className={`flex items-center p-3 rounded-lg ${
              daysRemaining <= 3 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                daysRemaining <= 3 ? 'bg-red-500' : 'bg-green-500'
              }`}>
                0
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  daysRemaining <= 3 ? 'text-red-900' : 'text-green-900'
                }`}>
                  Harvest Day
                </div>
                <div className={`text-sm ${
                  daysRemaining <= 3 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {daysRemaining <= 3 
                    ? 'Harvest window is here! Check trichomes and harvest when ready'
                    : 'Execute harvest plan based on final trichome assessment'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Details</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Prediction Method:</div>
                <div className="text-gray-900 font-medium">Stage Transition Analysis</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Data Source:</div>
                <div className="text-gray-900 font-medium">Historical Growth Cycles</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Current Stage:</div>
                <div className="text-gray-900 font-medium capitalize">{currentStage}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Stage Progress:</div>
                <div className="text-gray-900 font-medium">{Math.round(stageProgress)}% Complete</div>
              </div>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Harvest timing predictions are estimates based on typical growth patterns. 
                Always verify harvest readiness through visual inspection of trichomes and plant condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HarvestEstimator.propTypes = {
  predictions: PropTypes.object.isRequired,
  compact: PropTypes.bool
};

export default HarvestEstimator;
