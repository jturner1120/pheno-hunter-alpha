// src/components/dashboard/DashboardStates.jsx
import React from 'react';
import PropTypes from 'prop-types';
import billyBong from '../../assets/billy.png';

export const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen bg-patriot-gray">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-patriot-navy">Pheno Hunter</h1>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
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
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gray-200 rounded-lg h-20"></div>
            <div className="bg-gray-200 rounded-lg h-20"></div>
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const DashboardErrorState = ({ error, onRetry, onGoToLogin }) => {
  const isAuthError = error.includes('auth') || error.includes('unauthorized') || error.includes('permission');

  return (
    <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
      <div className="card text-center max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-4">
          <img src={billyBong} alt="Billy Bong" className="w-full h-full object-contain opacity-75" />
        </div>
        
        <h3 className="text-xl font-semibold text-patriot-navy mb-3">
          {isAuthError ? 'Authentication Required' : 'Oops! Something went wrong'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {isAuthError 
            ? 'Please log in again to access your dashboard.'
            : error || 'We encountered an issue loading your dashboard. Please try again.'
          }
        </p>

        <div className="space-y-3">
          {isAuthError ? (
            <button 
              onClick={onGoToLogin}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
          ) : (
            <>
              <button 
                onClick={onRetry}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button 
                onClick={onGoToLogin}
                className="btn-outline w-full"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

DashboardErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
};
