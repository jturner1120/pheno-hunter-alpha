// src/components/plants/advanced/PlantLifecycleTracker.jsx
import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { usePlantLifecycle, LIFECYCLE_STAGES } from '../../../hooks/usePlantLifecycle';

// Progress bar component for stage progression
const StageProgressBar = memo(({ currentStage, stageProgress, className = '' }) => {
  if (!currentStage || !stageProgress) return null;

  const { progress, daysInStage, isOverdue, isReady } = stageProgress;
  
  const getProgressColor = () => {
    if (isOverdue) return 'bg-red-500';
    if (isReady) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressText = () => {
    if (isOverdue) return 'Overdue';
    if (isReady) return 'Ready for next stage';
    return 'On track';
  };

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">
          {currentStage.name} Stage Progress
        </h4>
        <span className={`text-sm px-2 py-1 rounded-full ${
          isOverdue ? 'bg-red-100 text-red-800' :
          isReady ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {getProgressText()}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Day {daysInStage}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Expected duration: {currentStage.duration.min}-{currentStage.duration.max} days 
        (avg: {currentStage.duration.average})
      </div>
    </div>
  );
});

StageProgressBar.displayName = 'StageProgressBar';

// Visual timeline component
const LifecycleTimeline = memo(({ stageHistory, currentStage, className = '' }) => {
  const stages = Object.keys(LIFECYCLE_STAGES);
  const currentStageIndex = stages.indexOf(currentStage?.name?.toLowerCase().replace('-', ''));

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-4">Lifecycle Timeline</h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />
        
        {stages.map((stageKey, index) => {
          const stage = LIFECYCLE_STAGES[stageKey];
          const stageEntry = stageHistory.find(h => h.stage === stageKey);
          const isCompleted = stageEntry && stageEntry.endDate;
          const isCurrent = stageKey === currentStage?.name?.toLowerCase().replace('-', '');
          const isUpcoming = index > currentStageIndex;
          
          return (
            <div key={stageKey} className="relative flex items-start mb-6 last:mb-0">
              {/* Timeline dot */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                isCompleted ? 'bg-green-500 border-green-500' :
                isCurrent ? `border-current text-white` :
                isUpcoming ? 'bg-gray-100 border-gray-300' :
                'bg-gray-100 border-gray-300'
              }`} style={{ 
                backgroundColor: isCurrent ? stage.color : undefined,
                borderColor: isCurrent ? stage.color : undefined 
              }}>
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
              
              {/* Stage info */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className={`font-medium ${
                    isCurrent ? 'text-gray-900' : 
                    isCompleted ? 'text-gray-700' : 
                    'text-gray-500'
                  }`}>
                    {stage.name}
                  </h5>
                  {stageEntry && (
                    <span className="text-xs text-gray-500">
                      {stageEntry.endDate ? 
                        `${Math.floor((new Date(stageEntry.endDate) - new Date(stageEntry.startDate)) / (1000 * 60 * 60 * 24))} days` :
                        `Day ${Math.floor((new Date() - new Date(stageEntry.startDate)) / (1000 * 60 * 60 * 24))}`
                      }
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                {stageEntry && (
                  <div className="text-xs text-gray-500 mt-1">
                    Started: {new Date(stageEntry.startDate).toLocaleDateString()}
                    {stageEntry.endDate && (
                      <> • Ended: {new Date(stageEntry.endDate).toLocaleDateString()}</>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

LifecycleTimeline.displayName = 'LifecycleTimeline';

// Stage transition modal
const StageTransitionModal = memo(({ 
  isOpen, 
  onClose, 
  currentStage, 
  nextStage, 
  onTransition 
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransition = useCallback(async () => {
    if (!nextStage) return;
    
    setIsSubmitting(true);
    try {
      await onTransition(nextStage, { 
        notes: notes.trim(),
        triggeredBy: 'manual'
      });
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Transition failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [nextStage, notes, onTransition, onClose]);

  if (!isOpen || !nextStage) return null;

  const nextStageInfo = LIFECYCLE_STAGES[nextStage];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transition to {nextStageInfo.name}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            You're about to transition from <strong>{currentStage?.name}</strong> to{' '}
            <strong>{nextStageInfo.name}</strong>.
          </p>
          <p className="text-sm text-gray-600">
            {nextStageInfo.description}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="transition-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Transition Notes (optional)
          </label>
          <textarea
            id="transition-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record any observations or reasons for this transition..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-patriot-blue"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTransition}
            disabled={isSubmitting}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Transitioning...' : 'Confirm Transition'}
          </button>
        </div>
      </div>
    </div>
  );
});

StageTransitionModal.displayName = 'StageTransitionModal';

// Notification component
const LifecycleNotifications = memo(({ notifications, onDismiss, onTransition }) => {
  if (!notifications.length) return null;

  return (
    <div className="space-y-2 mb-4">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${
            notification.severity === 'warning' 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <div className="flex space-x-2">
              {notification.actions.includes('transition') && notification.stage && (
                <button
                  onClick={() => onTransition(notification.stage)}
                  className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
                >
                  Transition
                </button>
              )}
              <button
                onClick={() => onDismiss(index)}
                className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

LifecycleNotifications.displayName = 'LifecycleNotifications';

// Main PlantLifecycleTracker component
const PlantLifecycleTracker = ({ plantId, className = '' }) => {
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetStage, setTargetStage] = useState(null);

  const {
    plant,
    currentStage,
    stageHistory,
    loading,
    error,
    notifications,
    stageProgress,
    expectedHarvestDate,
    availableActions,
    transitionToStage,
    dismissNotification
  } = usePlantLifecycle(plantId);

  const handleTransitionClick = useCallback((stage) => {
    setTargetStage(stage);
    setShowTransitionModal(true);
  }, []);

  const handleTransition = useCallback(async (stage, options) => {
    await transitionToStage(stage, options);
    setShowTransitionModal(false);
    setTargetStage(null);
  }, [transitionToStage]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`} data-testid="loading-skeleton">
        <div className="bg-gray-200 rounded-lg h-48 mb-4" />
        <div className="bg-gray-200 rounded-lg h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800">Failed to load lifecycle data</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Notifications */}
      <LifecycleNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        onTransition={handleTransitionClick}
      />

      {/* Current stage info and progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Stage</h3>
            {currentStage?.nextStage && (
              <button
                onClick={() => handleTransitionClick(currentStage.nextStage)}
                className="btn-outline text-sm"
              >
                Advance to {LIFECYCLE_STAGES[currentStage.nextStage].name}
              </button>
            )}
          </div>

          {currentStage ? (
            <div>
              <div className="flex items-center mb-2">
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: currentStage.color }}
                />
                <h4 className="font-medium text-gray-900">{currentStage.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{currentStage.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <div className="text-gray-600">
                    {currentStage.duration.min}-{currentStage.duration.max} days
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Available Actions:</span>
                  <div className="text-gray-600">
                    {availableActions.join(', ')}
                  </div>
                </div>
              </div>

              {expectedHarvestDate && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">
                    Expected harvest: {expectedHarvestDate.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No lifecycle data available</p>
          )}
        </div>

        <StageProgressBar 
          currentStage={currentStage}
          stageProgress={stageProgress}
        />
      </div>

      {/* Timeline */}
      <LifecycleTimeline 
        stageHistory={stageHistory}
        currentStage={currentStage}
      />

      {/* Transition Modal */}
      <StageTransitionModal
        isOpen={showTransitionModal}
        onClose={() => {
          setShowTransitionModal(false);
          setTargetStage(null);
        }}
        currentStage={currentStage}
        nextStage={targetStage}
        onTransition={handleTransition}
      />
    </div>
  );
};

PlantLifecycleTracker.propTypes = {
  plantId: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default memo(PlantLifecycleTracker);
