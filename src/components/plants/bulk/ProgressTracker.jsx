// src/components/plants/bulk/ProgressTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ProgressItem = ({ item, status, error }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-white"></div>
        );
      case 'processing':
        return (
          <div className="h-4 w-4 rounded-full border-2 border-patriot-blue border-t-transparent animate-spin"></div>
        );
      case 'completed':
        return (
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'processing':
        return 'text-patriot-blue';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-3 py-2">
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${getStatusColor()}`}>
          {item.name}
        </p>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
      <div className="text-xs text-gray-400">
        {item.strain}
      </div>
    </div>
  );
};

const ProgressTracker = ({ 
  isOpen, 
  operation, 
  items, 
  progress, 
  onClose, 
  onCancel,
  canCancel = true 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track elapsed time
  useEffect(() => {
    if (isOpen && !startTime) {
      setStartTime(Date.now());
    }
  }, [isOpen, startTime]);

  useEffect(() => {
    if (!startTime || !isOpen) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStartTime(null);
      setElapsedTime(0);
      setShowDetails(false);
    }
  }, [isOpen]);

  const formatTime = useCallback((ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  const getProgressStats = useCallback(() => {
    const total = items.length;
    const completed = progress.completed?.length || 0;
    const failed = progress.failed?.length || 0;
    const processing = progress.processing?.length || 0;
    const pending = total - completed - failed - processing;

    return { total, completed, failed, processing, pending };
  }, [items.length, progress]);

  const stats = getProgressStats();
  const progressPercentage = items.length > 0 ? Math.round((stats.completed + stats.failed) / items.length * 100) : 0;
  const isComplete = stats.completed + stats.failed === items.length;
  const hasErrors = stats.failed > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {operation?.charAt(0).toUpperCase() + operation?.slice(1).replace('_', ' ')} Progress
          </h3>
          {isComplete && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isComplete ? 'Complete' : 'Processing'}
            </span>
            <span className="text-sm text-gray-500">
              {progressPercentage}% ({stats.completed + stats.failed}/{items.length})
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                hasErrors ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-patriot-blue">{stats.processing}</div>
            <div className="text-xs text-gray-500">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Time and Details Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Elapsed: {formatTime(elapsedTime)}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-patriot-blue hover:text-blue-700 flex items-center"
          >
            {showDetails ? 'Hide' : 'Show'} Details
            <svg 
              className={`ml-1 h-4 w-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="p-4 space-y-1">
              {/* Currently Processing */}
              {progress.processing?.map(item => (
                <ProgressItem 
                  key={item.id} 
                  item={item} 
                  status="processing"
                />
              ))}
              
              {/* Completed */}
              {progress.completed?.map(item => (
                <ProgressItem 
                  key={item.id} 
                  item={item} 
                  status="completed"
                />
              ))}
              
              {/* Failed */}
              {progress.failed?.map(item => (
                <ProgressItem 
                  key={item.id} 
                  item={item} 
                  status="error"
                  error={item.error}
                />
              ))}
              
              {/* Pending */}
              {items
                .filter(item => 
                  !progress.completed?.find(c => c.id === item.id) &&
                  !progress.failed?.find(f => f.id === item.id) &&
                  !progress.processing?.find(p => p.id === item.id)
                )
                .map(item => (
                  <ProgressItem 
                    key={item.id} 
                    item={item} 
                    status="pending"
                  />
                ))
              }
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div>
            {hasErrors && isComplete && (
              <span className="text-sm text-yellow-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Some operations failed
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            {!isComplete && canCancel && onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-patriot-blue"
              >
                Cancel
              </button>
            )}
            {isComplete && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-patriot-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:ring-offset-2"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProgressTracker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  operation: PropTypes.string,
  items: PropTypes.array.isRequired,
  progress: PropTypes.shape({
    completed: PropTypes.array,
    failed: PropTypes.array,
    processing: PropTypes.array
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  canCancel: PropTypes.bool
};

ProgressItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    strain: PropTypes.string,
    error: PropTypes.string
  }).isRequired,
  status: PropTypes.oneOf(['pending', 'processing', 'completed', 'error']).isRequired,
  error: PropTypes.string
};

export default ProgressTracker;
