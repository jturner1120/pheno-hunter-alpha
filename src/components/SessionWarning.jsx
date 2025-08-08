// src/components/SessionWarning.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';

const SessionWarning = () => {
  const { sessionWarning, timeUntilLogout, extendSession, logout } = useAuth();

  if (!sessionWarning) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Your session will expire due to inactivity. You will be automatically logged out in:
          </p>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {formatTime(timeUntilLogout)}
            </div>
            <p className="text-sm text-gray-500">
              minutes:seconds remaining
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={extendSession}
            className="flex-1 bg-patriot-blue text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patriot-blue transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={logout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Log Out Now
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For your security, we automatically log you out after 30 minutes of inactivity 
            or 8 hours of total session time.
          </p>
        </div>
      </div>
    </div>
  );
};

SessionWarning.propTypes = {};

export default SessionWarning;
