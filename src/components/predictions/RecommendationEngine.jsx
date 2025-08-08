// src/components/predictions/RecommendationEngine.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const RecommendationEngine = ({ recommendations, compact = false }) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  // Helper function to get type icon
  const getTypeIcon = (type) => {
    const icons = {
      'growth': '📈',
      'harvest': '🌾',
      'yield': '⚖️',
      'health': '❤️',
      'environment': '🌡️',
      'nutrition': '🧪',
      'problem': '⚠️',
      'maintenance': '🔧',
      'optimization': '⚡'
    };
    return icons[type] || '💡';
  };

  // Helper function to get action button text
  const getActionButtonText = (action) => {
    const actionMap = {
      'review_environment': 'Review Environment',
      'maintain_conditions': 'Maintain Current',
      'prepare_harvest': 'Prepare Harvest',
      'monitor_harvest_indicators': 'Monitor Closely',
      'collect_more_data': 'Collect Data',
      'check_nutrients_and_lighting': 'Check Setup',
      'consider_training_techniques': 'Training Options',
      'investigate_health_issues': 'Health Check',
      'evaluate_growing_conditions': 'Evaluate Conditions'
    };
    return actionMap[action] || 'Take Action';
  };

  if (compact) {
    const topRecommendations = recommendations.slice(0, 3);
    
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-600">
            {recommendations.length} active recommendations
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {topRecommendations.map((rec, index) => {
              const colors = getPriorityColor(rec.priority);
              return (
                <div key={index} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-start">
                    <div className="text-lg mr-2">{getTypeIcon(rec.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${colors.text}`}>
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recommendations.length > 3 && (
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  +{recommendations.length - 3} more recommendations
                </span>
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
        <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
        <p className="text-sm text-gray-600">
          Intelligent suggestions based on predictive analysis and best practices
        </p>
      </div>

      <div className="card-content">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Recommendations
            </h3>
            <p className="text-gray-600">
              Your plant is performing well with current conditions. 
              Keep up the great work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {recommendations.filter(r => r.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {recommendations.filter(r => r.priority === 'medium').length}
                </div>
                <div className="text-sm text-gray-600">Medium Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.filter(r => r.priority === 'low').length}
                </div>
                <div className="text-sm text-gray-600">Low Priority</div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => {
                const colors = getPriorityColor(recommendation.priority);
                const isExpanded = expandedRecommendation === index;

                return (
                  <div key={index} className={`border rounded-lg ${colors.border}`}>
                    <div className={`p-4 ${colors.bg}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          <div className="text-2xl mr-3">
                            {getTypeIcon(recommendation.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                                {recommendation.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {recommendation.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className={`text-sm font-medium ${colors.text} mb-2`}>
                              {recommendation.message}
                            </p>
                            
                            {/* Action Button */}
                            <button
                              className={`text-xs px-3 py-1 rounded border ${
                                recommendation.priority === 'high'
                                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                                  : recommendation.priority === 'medium'
                                  ? 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
                                  : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              } transition-colors`}
                            >
                              {getActionButtonText(recommendation.action)}
                            </button>
                          </div>
                        </div>
                        
                        {/* Expand Button */}
                        <button
                          onClick={() => setExpandedRecommendation(isExpanded ? null : index)}
                          className={`ml-2 p-1 rounded hover:bg-white/50 ${colors.text}`}
                        >
                          <svg 
                            className={`w-4 h-4 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="space-y-4">
                          {/* Detailed Explanation */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Why This Matters</h4>
                            <p className="text-sm text-gray-700">
                              {getDetailedExplanation(recommendation)}
                            </p>
                          </div>

                          {/* Action Steps */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {getActionSteps(recommendation).map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start">
                                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Expected Impact */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Expected Impact</h4>
                            <p className="text-sm text-gray-700">
                              {getExpectedImpact(recommendation)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get detailed explanation
function getDetailedExplanation(recommendation) {
  const explanations = {
    'growth': 'Plant growth rates indicate overall plant health and development speed. Optimal growth ensures proper development through each stage.',
    'harvest': 'Harvest timing is critical for maximizing potency, yield, and quality. Proper timing prevents over-ripening or premature harvest.',
    'yield': 'Yield optimization involves balancing multiple factors to achieve maximum harvest while maintaining quality.',
    'health': 'Plant health directly impacts all aspects of growth, development, and final harvest quality.',
    'problem': 'Early detection and resolution of issues prevents minor problems from becoming major setbacks.'
  };
  
  return explanations[recommendation.type] || 'This recommendation is based on AI analysis of your plant data and growing patterns.';
}

// Helper function to get action steps
function getActionSteps(recommendation) {
  const actionSteps = {
    'review_environment': [
      'Check light intensity and duration',
      'Verify temperature and humidity levels',
      'Inspect air circulation and ventilation',
      'Review recent environmental changes'
    ],
    'prepare_harvest': [
      'Clean and prepare harvesting tools',
      'Set up drying area with proper ventilation',
      'Plan harvest timing for optimal trichome development',
      'Prepare storage containers and labels'
    ],
    'check_nutrients_and_lighting': [
      'Test nutrient solution pH and EC levels',
      'Check light distance and intensity',
      'Review feeding schedule and adjust if needed',
      'Inspect for nutrient deficiency symptoms'
    ],
    'investigate_health_issues': [
      'Examine leaves for discoloration or damage',
      'Check for pest or disease signs',
      'Review recent care changes',
      'Consider consulting growing guides or experts'
    ]
  };
  
  return actionSteps[recommendation.action] || [
    'Review current growing conditions',
    'Make necessary adjustments',
    'Monitor plant response',
    'Document changes for future reference'
  ];
}

// Helper function to get expected impact
function getExpectedImpact(recommendation) {
  const impacts = {
    'high': 'Following this recommendation is critical and may prevent significant issues or losses.',
    'medium': 'This action will likely improve plant performance and overall cultivation success.',
    'low': 'Implementing this suggestion will help optimize conditions and enhance results.'
  };
  
  return impacts[recommendation.priority] || 'This action will contribute to better cultivation outcomes.';
}

RecommendationEngine.propTypes = {
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    message: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired
  })).isRequired,
  compact: PropTypes.bool
};

export default RecommendationEngine;
