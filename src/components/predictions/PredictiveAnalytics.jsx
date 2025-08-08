// src/components/predictions/PredictiveAnalytics.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePredictiveAnalytics } from '../../hooks/usePredictiveAnalytics';
import { useAuth } from '../../hooks/useAuth';
import ErrorBoundary from '../ErrorBoundary';
import GrowthPrediction from './GrowthPrediction';
import HarvestEstimator from './HarvestEstimator';
import YieldForecaster from './YieldForecaster';
import RecommendationEngine from './RecommendationEngine';

const PredictiveAnalytics = () => {
  const { user } = useAuth();
  const {
    // State
    loading,
    error,
    predictions,
    modelsTrained,
    lastTrainingDate,
    
    // Actions
    trainModels,
    generatePlantPredictions,
    generateAllPredictions,
    getRecommendations,
    clearError,
    
    // Computed values
    anyModelTrained,
    allModelsTrained,
    trainingProgress,
    needsRetraining
  } = usePredictiveAnalytics();

  // Local state
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [availablePlants, setAvailablePlants] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load available plants
  useEffect(() => {
    const loadPlants = async () => {
      try {
        // This would typically come from a plants hook or service
        const plants = []; // Placeholder - would load from firestoreService
        setAvailablePlants(plants);
        if (plants.length > 0 && !selectedPlantId) {
          setSelectedPlantId(plants[0].id);
        }
      } catch (error) {
        console.error('Failed to load plants:', error);
      }
    };

    if (user) {
      loadPlants();
    }
  }, [user, selectedPlantId]);

  // Auto-refresh predictions
  useEffect(() => {
    if (autoRefresh && selectedPlantId) {
      const interval = setInterval(() => {
        generatePlantPredictions(selectedPlantId);
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedPlantId, generatePlantPredictions]);

  // Handle plant selection
  const handlePlantSelect = async (plantId) => {
    setSelectedPlantId(plantId);
    if (plantId && anyModelTrained) {
      try {
        await generatePlantPredictions(plantId);
      } catch (error) {
        console.error('Failed to generate predictions:', error);
      }
    }
  };

  // Handle model retraining
  const handleRetrain = async () => {
    try {
      await trainModels();
      if (selectedPlantId) {
        await generatePlantPredictions(selectedPlantId);
      }
    } catch (error) {
      console.error('Failed to retrain models:', error);
    }
  };

  // Generate all predictions
  const handleGenerateAll = async () => {
    try {
      await generateAllPredictions();
    } catch (error) {
      console.error('Failed to generate all predictions:', error);
    }
  };

  // Get current plant predictions and recommendations
  const currentPredictions = selectedPlantId ? predictions[selectedPlantId] : null;
  const recommendations = selectedPlantId ? getRecommendations(selectedPlantId) : [];

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'growth', label: 'Growth Prediction', icon: '📈' },
    { id: 'harvest', label: 'Harvest Estimator', icon: '🌾' },
    { id: 'yield', label: 'Yield Forecaster', icon: '⚖️' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-patriot-gray">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
                <p className="mt-1 text-sm text-gray-600">
                  AI-powered insights and predictions for your cultivation
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Auto-refresh toggle */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-patriot-blue focus:ring-patriot-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
                </label>

                {/* Action buttons */}
                <button
                  onClick={handleRetrain}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Training...' : 'Retrain Models'}
                </button>
                
                <button
                  onClick={handleGenerateAll}
                  disabled={loading || !anyModelTrained}
                  className="btn-primary"
                >
                  Generate All Predictions
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Model Status */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Model Status</h2>
              {lastTrainingDate && (
                <p className="text-sm text-gray-600">
                  Last trained: {lastTrainingDate.toLocaleDateString()} at {lastTrainingDate.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="card-content">
              {/* Training Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Model Training Progress</span>
                  <span>{Math.round(trainingProgress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-patriot-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${trainingProgress * 100}%` }}
                  />
                </div>
              </div>

              {/* Model Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  modelsTrained.growth 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      modelsTrained.growth ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">Growth Prediction</h3>
                      <p className="text-sm text-gray-600">
                        {modelsTrained.growth ? 'Trained & Ready' : 'Not Trained'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  modelsTrained.harvest 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      modelsTrained.harvest ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">Harvest Estimation</h3>
                      <p className="text-sm text-gray-600">
                        {modelsTrained.harvest ? 'Trained & Ready' : 'Not Trained'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  modelsTrained.yield 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      modelsTrained.yield ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">Yield Forecasting</h3>
                      <p className="text-sm text-gray-600">
                        {modelsTrained.yield ? 'Trained & Ready' : 'Not Trained'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retraining Alert */}
              {needsRetraining && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Models Need Retraining</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        It's been more than a week since the last training. Consider retraining for improved accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plant Selection */}
          {availablePlants.length > 0 && (
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Select Plant for Analysis</h2>
              </div>
              <div className="card-content">
                <select
                  value={selectedPlantId}
                  onChange={(e) => handlePlantSelect(e.target.value)}
                  className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                >
                  <option value="">Choose a plant...</option>
                  {availablePlants.map(plant => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} ({plant.strain}) - {plant.stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="card mb-8 border-red-200">
              <div className="card-content">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Prediction Error</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                      <button
                        onClick={clearError}
                        className="mt-2 text-sm text-red-800 underline hover:text-red-600"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {anyModelTrained ? (
            <>
              {/* Navigation Tabs */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-patriot-blue text-patriot-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-8">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {currentPredictions?.growth && (
                      <GrowthPrediction 
                        predictions={currentPredictions.growth}
                        compact={true}
                      />
                    )}
                    {currentPredictions?.harvest && (
                      <HarvestEstimator 
                        predictions={currentPredictions.harvest}
                        compact={true}
                      />
                    )}
                    {currentPredictions?.yield && (
                      <YieldForecaster 
                        predictions={currentPredictions.yield}
                        compact={true}
                      />
                    )}
                    {recommendations.length > 0 && (
                      <RecommendationEngine 
                        recommendations={recommendations}
                        compact={true}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'growth' && currentPredictions?.growth && (
                  <GrowthPrediction predictions={currentPredictions.growth} />
                )}

                {activeTab === 'harvest' && currentPredictions?.harvest && (
                  <HarvestEstimator predictions={currentPredictions.harvest} />
                )}

                {activeTab === 'yield' && currentPredictions?.yield && (
                  <YieldForecaster predictions={currentPredictions.yield} />
                )}

                {activeTab === 'recommendations' && recommendations.length > 0 && (
                  <RecommendationEngine recommendations={recommendations} />
                )}
              </div>
            </>
          ) : (
            /* No Models Trained State */
            <div className="card">
              <div className="card-content text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Predictive Analytics Not Available
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  The AI models need to be trained with your plant data before predictions can be generated. 
                  This process analyzes your historical growing data to provide accurate forecasts.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Minimum requirements:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• At least 3 plants with growth measurements for growth predictions</li>
                    <li>• At least 3 completed grow cycles for harvest timing</li>
                    <li>• At least 5 harvested plants with yield data for yield forecasting</li>
                  </ul>
                  <button
                    onClick={handleRetrain}
                    disabled={loading}
                    className="btn-primary mt-6"
                  >
                    {loading ? 'Training Models...' : 'Train AI Models'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

PredictiveAnalytics.propTypes = {};

export default PredictiveAnalytics;
