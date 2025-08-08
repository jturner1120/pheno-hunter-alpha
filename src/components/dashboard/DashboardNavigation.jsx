// src/components/dashboard/DashboardNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';

const DashboardNavigation = ({ 
  onNavigateToAddPlant, 
  onNavigateToPlants, 
  onNavigateToAnalytics,
  onNavigateToReports,
  onNavigateToPredictions,
  hasPlants = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {/* Add Plant Card */}
      <div 
        className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
        onClick={onNavigateToAddPlant}
        onKeyDown={(e) => e.key === 'Enter' && onNavigateToAddPlant()}
        tabIndex={0}
        role="button"
        aria-label="Add a new plant to your collection"
      >
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold text-patriot-red mb-2 group-hover:text-red-700">
          {hasPlants ? 'Add Plant' : 'First Plant'}
        </h3>
        <p className="text-gray-600 text-sm">
          {hasPlants 
            ? 'Register a new plant in your collection.'
            : 'Start tracking your first plant.'
          }
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center text-sm text-patriot-red group-hover:text-red-700">
            {hasPlants ? 'Add Plant →' : 'Get Started →'}
          </span>
        </div>
      </div>

      {/* View Plants Card */}
      <div 
        className={`card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group ${
          !hasPlants ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={hasPlants ? onNavigateToPlants : undefined}
        onKeyDown={(e) => e.key === 'Enter' && hasPlants && onNavigateToPlants()}
        tabIndex={hasPlants ? 0 : -1}
        role="button"
        aria-label={hasPlants ? "View your plant collection" : "View plants (no plants added yet)"}
        aria-disabled={!hasPlants}
      >
        <div className="text-4xl mb-4">📋</div>
        <h3 className={`text-xl font-semibold mb-2 ${
          hasPlants 
            ? 'text-patriot-blue group-hover:text-blue-700' 
            : 'text-gray-400'
        }`}>
          View Plants
        </h3>
        <p className="text-gray-600 text-sm">
          {hasPlants 
            ? 'Browse and manage your plant collection.'
            : 'Your plants will appear here.'
          }
        </p>
        {hasPlants && (
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-patriot-blue group-hover:text-blue-700">
              View Collection →
            </span>
          </div>
        )}
      </div>

      {/* Analytics Card */}
      <div 
        className={`card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group ${
          !hasPlants ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={hasPlants ? onNavigateToAnalytics : undefined}
        onKeyDown={(e) => e.key === 'Enter' && hasPlants && onNavigateToAnalytics()}
        tabIndex={hasPlants ? 0 : -1}
        role="button"
        aria-label={hasPlants ? "View analytics and insights" : "Analytics (no plants added yet)"}
        aria-disabled={!hasPlants}
      >
        <div className="text-4xl mb-4">📊</div>
        <h3 className={`text-xl font-semibold mb-2 ${
          hasPlants 
            ? 'text-green-600 group-hover:text-green-700' 
            : 'text-gray-400'
        }`}>
          Analytics
        </h3>
        <p className="text-gray-600 text-sm">
          {hasPlants 
            ? 'View growth analytics and performance insights.'
            : 'Analytics will appear once you track plants.'
          }
        </p>
        {hasPlants && (
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-green-600 group-hover:text-green-700">
              View Analytics →
            </span>
          </div>
        )}
      </div>

      {/* Reports Card */}
      <div 
        className={`card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group ${
          !hasPlants ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={hasPlants ? onNavigateToReports : undefined}
        onKeyDown={(e) => e.key === 'Enter' && hasPlants && onNavigateToReports()}
        tabIndex={hasPlants ? 0 : -1}
        role="button"
        aria-label={hasPlants ? "Generate detailed reports" : "Reports (no plants added yet)"}
        aria-disabled={!hasPlants}
      >
        <div className="text-4xl mb-4">📄</div>
        <h3 className={`text-xl font-semibold mb-2 ${
          hasPlants 
            ? 'text-purple-600 group-hover:text-purple-700' 
            : 'text-gray-400'
        }`}>
          Reports
        </h3>
        <p className="text-gray-600 text-sm">
          {hasPlants 
            ? 'Generate detailed PDF reports and exports.'
            : 'Reports will be available once you track plants.'
          }
        </p>
        {hasPlants && (
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-purple-600 group-hover:text-purple-700">
              Generate Reports →
            </span>
          </div>
        )}
      </div>

      {/* Predictions Card */}
      <div 
        className={`card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group ${
          !hasPlants ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={hasPlants ? onNavigateToPredictions : undefined}
        onKeyDown={(e) => e.key === 'Enter' && hasPlants && onNavigateToPredictions()}
        tabIndex={hasPlants ? 0 : -1}
        role="button"
        aria-label={hasPlants ? "View AI predictions and forecasts" : "Predictions (no plants added yet)"}
        aria-disabled={!hasPlants}
      >
        <div className="text-4xl mb-4">🔮</div>
        <h3 className={`text-xl font-semibold mb-2 ${
          hasPlants 
            ? 'text-indigo-600 group-hover:text-indigo-700' 
            : 'text-gray-400'
        }`}>
          AI Predictions
        </h3>
        <p className="text-gray-600 text-sm">
          {hasPlants 
            ? 'Get AI-powered growth and harvest predictions.'
            : 'Predictions will be available once you track plants.'
          }
        </p>
        {hasPlants && (
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
              View Predictions →
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats Card - Always visible */}
      <div className="card text-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-4xl mb-4">⚡</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Quick Stats
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          At-a-glance overview of your cultivation progress.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Plants:</span>
            <span className="font-medium">{hasPlants ? '3' : '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active:</span>
            <span className="font-medium text-green-600">{hasPlants ? '2' : '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Harvested:</span>
            <span className="font-medium text-blue-600">{hasPlants ? '1' : '0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardNavigation.propTypes = {
  onNavigateToAddPlant: PropTypes.func.isRequired,
  onNavigateToPlants: PropTypes.func.isRequired,
  onNavigateToAnalytics: PropTypes.func.isRequired,
  onNavigateToReports: PropTypes.func.isRequired,
  onNavigateToPredictions: PropTypes.func.isRequired,
  hasPlants: PropTypes.bool,
};

export default DashboardNavigation;
