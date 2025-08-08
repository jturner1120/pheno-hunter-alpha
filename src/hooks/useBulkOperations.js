// src/hooks/useBulkOperations.js
import { useState, useCallback, useMemo } from 'react';
import { firestoreService } from '../utils/firestore';
import { logError, logInfo, logUserAction, logPerformance } from '../utils/logger';

// Bulk operation types
export const BULK_OPERATIONS = {
  UPDATE_STAGE: 'update_stage',
  UPDATE_STATUS: 'update_status',
  UPDATE_LOCATION: 'update_location',
  ADD_NOTES: 'add_notes',
  RECORD_METRICS: 'record_metrics',
  DELETE: 'delete',
  CLONE: 'clone',
  HARVEST: 'harvest',
  FEED: 'feed',
  WATER: 'water'
};

// Bulk operation configurations
const OPERATION_CONFIGS = {
  [BULK_OPERATIONS.UPDATE_STAGE]: {
    label: 'Update Growth Stage',
    icon: '🌱',
    requiresInput: true,
    inputType: 'select',
    inputOptions: ['seedling', 'vegetative', 'pre-flower', 'flowering', 'harvest'],
    batchSize: 10,
    estimatedTime: 2000, // ms per item
    undoable: true,
    description: 'Transition selected plants to a new growth stage'
  },
  [BULK_OPERATIONS.UPDATE_STATUS]: {
    label: 'Update Status',
    icon: '📊',
    requiresInput: true,
    inputType: 'select',
    inputOptions: ['healthy', 'flowering', 'issues', 'harvested'],
    batchSize: 20,
    estimatedTime: 1000,
    undoable: true,
    description: 'Update the status of selected plants'
  },
  [BULK_OPERATIONS.UPDATE_LOCATION]: {
    label: 'Update Location',
    icon: '📍',
    requiresInput: true,
    inputType: 'text',
    placeholder: 'Enter new location (e.g., Tent A, Room 2)',
    batchSize: 15,
    estimatedTime: 1500,
    undoable: true,
    description: 'Move selected plants to a new location'
  },
  [BULK_OPERATIONS.ADD_NOTES]: {
    label: 'Add Notes',
    icon: '📝',
    requiresInput: true,
    inputType: 'textarea',
    placeholder: 'Enter notes to add to all selected plants',
    batchSize: 10,
    estimatedTime: 2000,
    undoable: false,
    description: 'Add the same note to all selected plants'
  },
  [BULK_OPERATIONS.RECORD_METRICS]: {
    label: 'Record Metrics',
    icon: '📏',
    requiresInput: true,
    inputType: 'metrics',
    batchSize: 5,
    estimatedTime: 3000,
    undoable: false,
    description: 'Record growth metrics for selected plants'
  },
  [BULK_OPERATIONS.DELETE]: {
    label: 'Delete Plants',
    icon: '🗑️',
    requiresInput: false,
    batchSize: 5,
    estimatedTime: 2000,
    undoable: false,
    destructive: true,
    description: 'Permanently delete selected plants'
  },
  [BULK_OPERATIONS.CLONE]: {
    label: 'Create Clones',
    icon: '🌿',
    requiresInput: true,
    inputType: 'clone_config',
    batchSize: 3,
    estimatedTime: 5000,
    undoable: false,
    description: 'Create clones from selected plants'
  },
  [BULK_OPERATIONS.HARVEST]: {
    label: 'Harvest Plants',
    icon: '🌾',
    requiresInput: true,
    inputType: 'harvest_data',
    batchSize: 5,
    estimatedTime: 4000,
    undoable: false,
    description: 'Record harvest data for selected plants'
  }
};

export const useBulkOperations = () => {
  const [selectedPlants, setSelectedPlants] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);
  const [error, setError] = useState(null);

  // Selection management
  const togglePlantSelection = useCallback((plantId) => {
    setSelectedPlants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(plantId)) {
        newSet.delete(plantId);
      } else {
        newSet.add(plantId);
      }
      return newSet;
    });
  }, []);

  const selectAllPlants = useCallback((plantIds) => {
    setSelectedPlants(new Set(plantIds));
  }, []);

  const selectPlantsByFilter = useCallback((plants, filterFn) => {
    if (!Array.isArray(plants)) return;
    const filteredIds = plants.filter(filterFn).map(p => p.id);
    setSelectedPlants(new Set(filteredIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlants(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) {
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  // Get selected plant data
  const getSelectedPlants = useCallback((allPlants) => {
    if (!Array.isArray(allPlants)) return [];
    return allPlants.filter(plant => selectedPlants.has(plant.id));
  }, [selectedPlants]);

  // Computed values
  const selectionCount = selectedPlants.size;
  const hasSelection = selectionCount > 0;

  // Operation execution
  const executeOperation = useCallback(async (operation, inputData, plants) => {
    if (!hasSelection || !operation) return;

    const config = OPERATION_CONFIGS[operation];
    if (!config) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    setCurrentOperation(operation);
    setError(null);
    
    const selectedPlantData = getSelectedPlants(plants);
    const totalItems = selectedPlantData.length;
    const batchSize = config.batchSize;
    const batches = Math.ceil(totalItems / batchSize);

    // Initialize progress tracking
    setOperationProgress({
      operation,
      total: totalItems,
      completed: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: batches,
      startTime: Date.now(),
      estimatedEndTime: Date.now() + (totalItems * config.estimatedTime),
      errors: []
    });

    const results = {
      successful: [],
      failed: [],
      undoData: config.undoable ? [] : null
    };

    try {
      // Process in batches
      for (let i = 0; i < batches; i++) {
        const batchStart = i * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, totalItems);
        const batch = selectedPlantData.slice(batchStart, batchEnd);

        setOperationProgress(prev => ({
          ...prev,
          currentBatch: i + 1
        }));

        // Process batch
        await Promise.allSettled(
          batch.map(async (plant) => {
            try {
              const result = await executeOperationOnPlant(operation, plant, inputData);
              
              results.successful.push(plant.id);
              
              // Store undo data if operation is undoable
              if (config.undoable && result.undoData) {
                results.undoData.push({
                  plantId: plant.id,
                  undoData: result.undoData
                });
              }

              // Update progress
              setOperationProgress(prev => ({
                ...prev,
                completed: prev.completed + 1
              }));

            } catch (error) {
              logError(new Error(`Bulk operation failed for plant ${plant.id}`), { error, plantId: plant.id });
              results.failed.push({ plantId: plant.id, error: error.message });
              
              setOperationProgress(prev => ({
                ...prev,
                failed: prev.failed + 1,
                errors: [...prev.errors, { plantId: plant.id, error: error.message }]
              }));
            }
          })
        );

        // Small delay between batches to prevent overwhelming the system
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Record operation in history
      const historyEntry = {
        id: Date.now().toString(),
        operation,
        timestamp: new Date().toISOString(),
        plantCount: totalItems,
        successful: results.successful.length,
        failed: results.failed.length,
        inputData,
        undoData: results.undoData,
        undoable: config.undoable
      };

      setOperationHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10

      logInfo(`Bulk operation completed`, historyEntry);

    } catch (error) {
      logError(error, { operation: 'bulk operation' });
      setError(`Operation failed: ${error.message}`);
    } finally {
      // Clear current operation after a delay to show completion
      setTimeout(() => {
        setCurrentOperation(null);
        setOperationProgress(null);
      }, 2000);
    }

    return results;
  }, [hasSelection, getSelectedPlants]);

  // Execute operation on a single plant
  const executeOperationOnPlant = async (operation, plant, inputData) => {
    const timestamp = new Date().toISOString();

    switch (operation) {
      case BULK_OPERATIONS.UPDATE_STAGE:
        const oldStage = plant.lifecycle?.currentStage;
        await firestoreService.updateDocument('plants', plant.id, {
          'lifecycle.currentStage': inputData.stage,
          'lifecycle.lastUpdated': timestamp,
          [`lifecycle.stageHistory`]: [
            ...(plant.lifecycle?.stageHistory || []),
            {
              stage: inputData.stage,
              startDate: timestamp,
              endDate: null,
              triggeredBy: 'bulk-operation',
              notes: inputData.notes || ''
            }
          ]
        });
        return { undoData: { field: 'lifecycle.currentStage', oldValue: oldStage } };

      case BULK_OPERATIONS.UPDATE_STATUS:
        const oldStatus = plant.status;
        await firestoreService.updateDocument('plants', plant.id, {
          status: inputData.status,
          statusUpdatedAt: timestamp
        });
        return { undoData: { field: 'status', oldValue: oldStatus } };

      case BULK_OPERATIONS.UPDATE_LOCATION:
        const oldLocation = plant.location;
        await firestoreService.updateDocument('plants', plant.id, {
          location: inputData.location,
          locationUpdatedAt: timestamp
        });
        return { undoData: { field: 'location', oldValue: oldLocation } };

      case BULK_OPERATIONS.ADD_NOTES:
        await firestoreService.addToSubcollection('plants', plant.id, 'notes', {
          content: inputData.note,
          type: 'bulk-operation',
          timestamp,
          author: 'user' // TODO: Get from auth context
        });
        return {};

      case BULK_OPERATIONS.RECORD_METRICS:
        await firestoreService.addToSubcollection('plants', plant.id, 'metrics', {
          ...inputData.metrics,
          recordedAt: timestamp,
          stage: plant.lifecycle?.currentStage || 'unknown',
          source: 'bulk-operation'
        });
        return {};

      case BULK_OPERATIONS.DELETE:
        // Store plant data for potential recovery
        const plantData = { ...plant };
        await firestoreService.deleteDocument('plants', plant.id);
        return { undoData: { plantData } };

      default:
        throw new Error(`Operation ${operation} not implemented`);
    }
  };

  // Undo last operation
  const undoLastOperation = useCallback(async () => {
    const lastOperation = operationHistory[0];
    if (!lastOperation || !lastOperation.undoable || !lastOperation.undoData) {
      throw new Error('No undoable operation found');
    }

    try {
      setCurrentOperation('undo');
      setError(null);

      for (const undoItem of lastOperation.undoData) {
        const { plantId, undoData } = undoItem;
        
        if (undoData.plantData) {
          // Restore deleted plant
          await firestoreService.createDocument('plants', undoData.plantData);
        } else {
          // Restore field value
          await firestoreService.updateDocument('plants', plantId, {
            [undoData.field]: undoData.oldValue
          });
        }
      }

      // Remove operation from history
      setOperationHistory(prev => prev.slice(1));
      
      logInfo('Operation undone successfully');

    } catch (error) {
      logError(error, { operation: 'undo operation' });
      setError(`Undo failed: ${error.message}`);
    } finally {
      setCurrentOperation(null);
    }
  }, [operationHistory]);

  // Get available operations for selected plants
  const getAvailableOperations = useCallback((selectedPlantData) => {
    // Ensure selectedPlantData is an array
    if (!Array.isArray(selectedPlantData) || !selectedPlantData.length) return [];

    const operations = Object.keys(BULK_OPERATIONS);
    
    // Filter operations based on plant states
    return operations.filter(op => {
      const config = OPERATION_CONFIGS[op];
      
      // Example: Can't harvest already harvested plants
      if (op === BULK_OPERATIONS.HARVEST) {
        return selectedPlantData.some(p => p.status !== 'harvested');
      }
      
      // Example: Can't clone harvested plants
      if (op === BULK_OPERATIONS.CLONE) {
        return selectedPlantData.some(p => p.status !== 'harvested');
      }
      
      return true;
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Selection state
    selectedPlants, // Keep as Set for ID checking
    isSelectionMode,
    selectionCount,
    hasSelection,

    // Operation state
    currentOperation,
    operationProgress,
    operationHistory,
    error,

    // Selection actions
    togglePlantSelection,
    togglePlant: togglePlantSelection, // Alias for backward compatibility
    selectAllPlants,
    selectPlantsByFilter,
    clearSelection,
    toggleSelectionMode,
    getSelectedPlants,

    // Operation actions
    executeOperation,
    undoLastOperation,
    getAvailableOperations,
    clearError,

    // Constants
    BULK_OPERATIONS,
    OPERATION_CONFIGS
  };
};
