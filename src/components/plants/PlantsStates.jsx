import React from 'react';
import PropTypes from 'prop-types';

const PlantsLoadingState = () => {
  return (
    <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-patriot-blue"></div>
          <span className="text-patriot-navy">Loading plants...</span>
        </div>
      </div>
    </div>
  );
};

const PlantsErrorState = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
      <div className="card max-w-md">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Plants
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

PlantsErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};

export { PlantsLoadingState, PlantsErrorState };
