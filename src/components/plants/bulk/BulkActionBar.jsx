// src/components/plants/bulk/BulkActionBar.jsx
import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useMultiSelect } from './MultiSelectProvider';
import BulkEditModal from './BulkEditModal';
import ProgressTracker from './ProgressTracker';

const QuickActionButton = memo(({ operation, config, onClick, disabled }) => (
  <button
    onClick={() => onClick(operation)}
    disabled={disabled}
    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
      config.destructive
        ? 'text-red-700 hover:bg-red-50 hover:border-red-400'
        : 'text-gray-700 hover:bg-gray-50 hover:border-gray-400'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
    title={config.description}
  >
    <span className="mr-2">{config.icon}</span>
    {config.label}
  </button>
));

QuickActionButton.displayName = 'QuickActionButton';

const SelectionStats = memo(({ count, total, onSelectAll, onClearAll }) => (
  <div className="flex items-center space-x-4">
    <div className="text-sm text-gray-600">
      <span className="font-medium">{count}</span> of <span className="font-medium">{total}</span> selected
    </div>
    <div className="flex space-x-2">
      <button
        onClick={onSelectAll}
        className="text-sm text-patriot-blue hover:text-blue-700"
      >
        Select All
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={onClearAll}
        className="text-sm text-gray-600 hover:text-gray-800"
      >
        Clear
      </button>
    </div>
  </div>
));

SelectionStats.displayName = 'SelectionStats';

const BulkActionBar = ({ plants, className = '' }) => {
  const {
    selectionCount,
    hasSelection,
    isSelectionMode,
    toggleSelectionMode,
    selectAllPlants,
    clearSelection,
    getSelectedPlants,
    getAvailableOperations,
    executeOperation,
    currentOperation,
    operationProgress,
    undoLastOperation,
    operationHistory,
    OPERATION_CONFIGS
  } = useMultiSelect();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);

  const selectedPlantData = getSelectedPlants(plants);
  const availableOperations = getAvailableOperations(selectedPlantData);

  // Quick actions that don't need input
  const quickActions = [
    'update_status',
    'delete'
  ].filter(op => availableOperations.includes(op));

  // Actions that need input modal
  const modalActions = availableOperations.filter(op => !quickActions.includes(op));

  const handleQuickAction = useCallback(async (operation) => {
    if (!hasSelection) return;

    const config = OPERATION_CONFIGS[operation];
    
    // For destructive operations, show confirmation
    if (config.destructive) {
      const confirmed = window.confirm(
        `Are you sure you want to ${config.label.toLowerCase()} ${selectionCount} plant(s)? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await executeOperation(operation, {}, plants);
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  }, [hasSelection, selectionCount, executeOperation, plants, OPERATION_CONFIGS]);

  const handleModalAction = useCallback((operation) => {
    setSelectedOperation(operation);
    setShowBulkModal(true);
  }, []);

  const handleModalSubmit = useCallback(async (operation, inputData) => {
    try {
      await executeOperation(operation, inputData, plants);
      setShowBulkModal(false);
      setSelectedOperation(null);
    } catch (error) {
      console.error('Modal action failed:', error);
    }
  }, [executeOperation, plants]);

  const handleModalClose = useCallback(() => {
    setShowBulkModal(false);
    setSelectedOperation(null);
  }, []);

  const handleSelectAll = useCallback(() => {
    selectAllPlants(plants.map(p => p.id));
  }, [selectAllPlants, plants]);

  const handleUndo = useCallback(async () => {
    try {
      await undoLastOperation();
    } catch (error) {
      console.error('Undo failed:', error);
      alert('Failed to undo operation: ' + error.message);
    }
  }, [undoLastOperation]);

  // Show progress tracker if operation is running
  if (currentOperation && operationProgress) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <ProgressTracker progress={operationProgress} />
      </div>
    );
  }

  if (!isSelectionMode) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Manage multiple plants efficiently with bulk operations
          </div>
          <div className="flex items-center space-x-3">
            {operationHistory.length > 0 && operationHistory[0].undoable && (
              <button
                onClick={handleUndo}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Undo last operation"
              >
                <span className="mr-2">↶</span>
                Undo
              </button>
            )}
            <button
              onClick={toggleSelectionMode}
              className="btn-primary"
            >
              <span className="mr-2">☑️</span>
              Select Plants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        {/* Selection Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SelectionStats
              count={selectionCount}
              total={plants.length}
              onSelectAll={handleSelectAll}
              onClearAll={clearSelection}
            />
            <button
              onClick={toggleSelectionMode}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Exit Selection
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {hasSelection && (
          <div className="p-4">
            <div className="space-y-4">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map(operation => (
                      <QuickActionButton
                        key={operation}
                        operation={operation}
                        config={OPERATION_CONFIGS[operation]}
                        onClick={handleQuickAction}
                        disabled={currentOperation}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              {modalActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Advanced Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {modalActions.map(operation => (
                      <QuickActionButton
                        key={operation}
                        operation={operation}
                        config={OPERATION_CONFIGS[operation]}
                        onClick={handleModalAction}
                        disabled={currentOperation}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Smart Suggestions</h4>
                <p className="text-sm text-blue-700">
                  {selectedPlantData.length > 1 && selectedPlantData.every(p => p.lifecycle?.currentStage === 'vegetative') &&
                    "All selected plants are in vegetative stage - consider updating to pre-flower if ready."
                  }
                  {selectedPlantData.length > 1 && selectedPlantData.every(p => !p.location) &&
                    "Selected plants don't have locations set - use 'Update Location' to organize them."
                  }
                  {selectedPlantData.length > 5 &&
                    "Consider using 'Record Metrics' to track growth data across all selected plants."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!hasSelection && (
          <div className="p-4 text-center">
            <div className="text-gray-500 mb-2">
              <span className="text-2xl">☑️</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Select plants to perform bulk operations</p>
            <p className="text-xs text-gray-500">
              Click the checkboxes next to plants or use "Select All" to get started
            </p>
          </div>
        )}
      </div>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkModal}
        operation={selectedOperation}
        selectedPlants={selectedPlantData}
        onSubmit={handleModalSubmit}
        onClose={handleModalClose}
      />
    </>
  );
};

BulkActionBar.propTypes = {
  plants: PropTypes.array.isRequired,
  className: PropTypes.string
};

QuickActionButton.propTypes = {
  operation: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

SelectionStats.propTypes = {
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired
};

export default memo(BulkActionBar);
