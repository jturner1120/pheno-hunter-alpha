// src/components/analytics/AnalyticsStates.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import billyBong from '../../assets/billy.png';

export const AnalyticsLoadingState = () => {
  return (
    <div className="min-h-screen bg-patriot-gray">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4">
            <img 
              src={billyBong} 
              alt="Billy Bong" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-patriot-blue mr-3"></div>
            <span className="text-lg text-gray-600">Loading analytics data...</span>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="animate-pulse space-y-6">
          {/* Filter skeleton */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Chart skeletons */}
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="p-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export const AnalyticsErrorState = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToPlants = () => {
    navigate('/plants');
  };

  return (
    <div className="min-h-screen bg-patriot-gray">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={handleGoToDashboard}
                className="text-patriot-blue hover:text-blue-700 mr-4"
                aria-label="Back to Dashboard"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-patriot-navy">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src={billyBong} 
              alt="Billy Bong" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to Load Analytics
            </h2>
            <p className="text-gray-600 mb-8">
              {error || 'There was a problem loading your analytics data. Please try again.'}
            </p>

            <div className="space-y-4">
              <button
                onClick={onRetry}
                className="w-full bg-patriot-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleGoToDashboard}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleGoToPlants}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Plants
                </button>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>If the problem persists, try:</p>
              <ul className="mt-2 space-y-1">
                <li>• Checking your internet connection</li>
                <li>• Refreshing the page</li>
                <li>• Recording some plant measurements first</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const AnalyticsEmptyState = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddPlant = () => {
    navigate('/plant');
  };

  return (
    <div className="min-h-screen bg-patriot-gray">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={handleGoToDashboard}
                className="text-patriot-blue hover:text-blue-700 mr-4"
                aria-label="Back to Dashboard"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-patriot-navy">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src={billyBong} 
              alt="Billy Bong" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your Analytics Journey
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Add your first plant to begin tracking growth, performance, and trends. 
              Your analytics dashboard will come alive with insights as you build your collection.
            </p>

            <div className="bg-white rounded-lg p-8 max-w-lg mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What you'll see with analytics:
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-lg">📈</span>
                  <span className="text-gray-700">Growth trends and rates over time</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-3 text-lg">🌿</span>
                  <span className="text-gray-700">Strain performance comparisons</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-500 mr-3 text-lg">📊</span>
                  <span className="text-gray-700">Yield and success rate analysis</span>
                </div>
                <div className="flex items-center">
                  <span className="text-orange-500 mr-3 text-lg">📅</span>
                  <span className="text-gray-700">Activity patterns and timelines</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddPlant}
                className="bg-patriot-blue text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Add Your First Plant
              </button>
              
              <div>
                <button
                  onClick={handleGoToDashboard}
                  className="text-patriot-blue hover:text-blue-700 text-sm"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

AnalyticsErrorState.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired
};

export default {
  AnalyticsLoadingState,
  AnalyticsErrorState,
  AnalyticsEmptyState
};
