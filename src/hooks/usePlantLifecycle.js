// src/hooks/usePlantLifecycle.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { firestoreService } from '../utils/firestore';
import { logError, logInfo, logUserAction, logPerformance } from '../utils/logger';

// Plant lifecycle stages with metadata
export const LIFECYCLE_STAGES = {
  seedling: {
    name: 'Seedling',
    duration: { min: 7, max: 21, average: 14 }, // days
    description: 'Initial growth phase with cotyledons and first true leaves',
    actions: ['water', 'transplant', 'note'],
    indicators: ['cotyledons-present', 'first-true-leaves'],
    nextStage: 'vegetative',
    color: '#22c55e'
  },
  vegetative: {
    name: 'Vegetative',
    duration: { min: 28, max: 84, average: 42 },
    description: 'Active growth phase building plant structure',
    actions: ['water', 'feed', 'prune', 'train', 'transplant', 'clone', 'note'],
    indicators: ['rapid-growth', 'new-nodes', 'branching'],
    nextStage: 'pre-flower',
    color: '#16a34a'
  },
  'pre-flower': {
    name: 'Pre-flower',
    duration: { min: 7, max: 14, average: 10 },
    description: 'Transition phase showing early flowering signs',
    actions: ['water', 'feed', 'defoliate', 'note'],
    indicators: ['pistils-showing', 'stretch-beginning', 'sex-determination'],
    nextStage: 'flowering',
    color: '#eab308'
  },
  flowering: {
    name: 'Flowering',
    duration: { min: 49, max: 84, average: 63 },
    description: 'Flower development and maturation',
    actions: ['water', 'feed', 'support', 'monitor-trichomes', 'note'],
    indicators: ['flower-development', 'trichome-development', 'aroma'],
    nextStage: 'harvest',
    color: '#dc2626'
  },
  harvest: {
    name: 'Harvest',
    duration: { min: 1, max: 7, average: 1 },
    description: 'Plant ready for harvest',
    actions: ['harvest', 'dry', 'cure', 'note'],
    indicators: ['cloudy-trichomes', 'amber-trichomes', 'pistil-color'],
    nextStage: null,
    color: '#7c3aed'
  }
};

// Automatic transition triggers
const AUTO_TRANSITION_RULES = {
  'seedling-to-vegetative': {
    timeBased: { minDays: 14, maxDays: 21 },
    indicators: ['first-true-leaves', 'established-roots'],
    conditions: ['healthy-growth', 'no-stress-signs']
  },
  'vegetative-to-preflower': {
    timeBased: { minDays: 28 }, // No max - user controlled
    lightSchedule: '12/12',
    conditions: ['mature-plant', 'ready-for-flower']
  },
  'preflower-to-flowering': {
    timeBased: { minDays: 7, maxDays: 14 },
    indicators: ['pistils-visible', 'flower-sites-developing'],
    conditions: ['sex-determined', 'stretch-complete']
  },
  'flowering-to-harvest': {
    timeBased: { minDays: 49 },
    indicators: ['cloudy-trichomes', 'amber-percentage'],
    conditions: ['flowers-mature', 'optimal-harvest-window']
  }
};

export const usePlantLifecycle = (plantId) => {
  const [plant, setPlant] = useState(null);
  const [stageHistory, setStageHistory] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Current stage information
  const currentStage = useMemo(() => {
    if (!plant?.lifecycle?.currentStage) return null;
    return LIFECYCLE_STAGES[plant.lifecycle.currentStage];
  }, [plant?.lifecycle?.currentStage]);

  // Stage progress calculation
  const stageProgress = useMemo(() => {
    if (!plant?.lifecycle?.stageHistory || !currentStage) return null;

    const currentStageEntry = plant.lifecycle.stageHistory.find(
      stage => stage.stage === plant.lifecycle.currentStage && !stage.endDate
    );

    if (!currentStageEntry) return null;

    const startDate = new Date(currentStageEntry.startDate);
    const now = new Date();
    const daysInStage = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(
      (daysInStage / currentStage.duration.average) * 100,
      100
    );

    return {
      daysInStage,
      progress,
      isOverdue: daysInStage > currentStage.duration.max,
      isReady: daysInStage >= currentStage.duration.min
    };
  }, [plant?.lifecycle, currentStage]);

  // Expected harvest date calculation
  const expectedHarvestDate = useMemo(() => {
    if (!plant?.lifecycle?.stageHistory) return null;

    const currentStageEntry = plant.lifecycle.stageHistory.find(
      stage => stage.stage === plant.lifecycle.currentStage && !stage.endDate
    );

    if (!currentStageEntry) return null;

    let totalDays = 0;
    let currentStageKey = plant.lifecycle.currentStage;

    // Add remaining days for current stage
    const startDate = new Date(currentStageEntry.startDate);
    const now = new Date();
    const daysInCurrentStage = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const remainingInCurrent = Math.max(
      0, 
      LIFECYCLE_STAGES[currentStageKey].duration.average - daysInCurrentStage
    );
    totalDays += remainingInCurrent;

    // Add average duration for remaining stages
    while (currentStageKey && LIFECYCLE_STAGES[currentStageKey].nextStage) {
      currentStageKey = LIFECYCLE_STAGES[currentStageKey].nextStage;
      totalDays += LIFECYCLE_STAGES[currentStageKey].duration.average;
    }

    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + totalDays);
    return harvestDate;
  }, [plant?.lifecycle]);

  // Load plant data and lifecycle history
  useEffect(() => {
    if (!plantId) return;

    const loadPlantData = async () => {
      try {
        setLoading(true);
        setError(null);

        const plantData = await firestoreService.getDocument('plants', plantId);
        setPlant(plantData);

        // Load stage history
        if (plantData?.lifecycle?.stageHistory) {
          setStageHistory(plantData.lifecycle.stageHistory);
        }

        // Load metrics
        const metricsData = await firestoreService.getSubcollection(
          'plants', 
          plantId, 
          'metrics'
        );
        setMetrics(metricsData);

      } catch (err) {
        logError(err, { operation: 'load plant lifecycle data' });
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlantData();
  }, [plantId]);

  // Check for automatic stage transitions
  useEffect(() => {
    if (!plant || !currentStage || !stageProgress) return;

    const checkAutoTransitions = () => {
      const newNotifications = [];

      // Check if ready for next stage
      if (stageProgress.isReady && currentStage.nextStage) {
        newNotifications.push({
          type: 'stage-ready',
          stage: currentStage.nextStage,
          message: `${plant.name} may be ready to transition to ${LIFECYCLE_STAGES[currentStage.nextStage].name}`,
          severity: 'info',
          actions: ['transition', 'dismiss']
        });
      }

      // Check if overdue
      if (stageProgress.isOverdue) {
        newNotifications.push({
          type: 'stage-overdue',
          stage: plant.lifecycle.currentStage,
          message: `${plant.name} has been in ${currentStage.name} stage longer than expected`,
          severity: 'warning',
          actions: ['transition', 'extend', 'dismiss']
        });
      }

      setNotifications(prev => {
        const existingTypes = prev.map(n => n.type);
        const newTypes = newNotifications.filter(n => !existingTypes.includes(n.type));
        return [...prev, ...newTypes];
      });
    };

    checkAutoTransitions();
  }, [plant, currentStage, stageProgress]);

  // Transition to next stage
  const transitionToStage = useCallback(async (targetStage, options = {}) => {
    if (!plant || !plantId) return;

    try {
      const now = new Date().toISOString();
      
      // End current stage
      const updatedHistory = plant.lifecycle.stageHistory.map(stage => 
        stage.stage === plant.lifecycle.currentStage && !stage.endDate
          ? { ...stage, endDate: now }
          : stage
      );

      // Add new stage
      updatedHistory.push({
        stage: targetStage,
        startDate: now,
        endDate: null,
        triggeredBy: options.triggeredBy || 'manual',
        notes: options.notes || ''
      });

      const lifecycleUpdate = {
        currentStage: targetStage,
        stageHistory: updatedHistory,
        lastUpdated: now
      };

      await firestoreService.updateDocument('plants', plantId, {
        lifecycle: lifecycleUpdate
      });

      // Update local state
      setPlant(prev => ({
        ...prev,
        lifecycle: lifecycleUpdate
      }));

      setStageHistory(updatedHistory);

      // Clear related notifications
      setNotifications(prev => 
        prev.filter(n => !['stage-ready', 'stage-overdue'].includes(n.type))
      );

      logInfo(`Plant ${plantId} transitioned to ${targetStage}`);

    } catch (err) {
      logError(err, { operation: 'transition plant stage', plantId, targetStage });
      throw err;
    }
  }, [plant, plantId]);

  // Record growth metrics
  const recordMetrics = useCallback(async (metricsData) => {
    if (!plantId) return;

    try {
      const timestamp = new Date().toISOString();
      const metricEntry = {
        ...metricsData,
        recordedAt: timestamp,
        stage: plant?.lifecycle?.currentStage || 'unknown'
      };

      await firestoreService.addToSubcollection(
        'plants',
        plantId,
        'metrics',
        metricEntry
      );

      setMetrics(prev => ({
        ...prev,
        [timestamp]: metricEntry
      }));

    } catch (err) {
      logError(err, { operation: 'record metrics', plantId });
      throw err;
    }
  }, [plantId, plant?.lifecycle?.currentStage]);

  // Add stage note
  const addStageNote = useCallback(async (note, type = 'observation') => {
    if (!plantId || !note.trim()) return;

    try {
      const timestamp = new Date().toISOString();
      const noteEntry = {
        content: note.trim(),
        type,
        stage: plant?.lifecycle?.currentStage || 'unknown',
        timestamp,
        author: 'user' // TODO: Get from auth context
      };

      await firestoreService.addToSubcollection(
        'plants',
        plantId,
        'notes',
        noteEntry
      );

    } catch (err) {
      logError(err, { operation: 'add stage note', plantId });
      throw err;
    }
  }, [plantId, plant?.lifecycle?.currentStage]);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter((_, index) => index !== notificationId));
  }, []);

  // Get available actions for current stage
  const availableActions = useMemo(() => {
    if (!currentStage) return [];
    return currentStage.actions;
  }, [currentStage]);

  // Get stage statistics
  const stageStatistics = useMemo(() => {
    if (!stageHistory.length) return null;

    const completedStages = stageHistory.filter(stage => stage.endDate);
    const stats = {};

    completedStages.forEach(stage => {
      const duration = Math.floor(
        (new Date(stage.endDate) - new Date(stage.startDate)) / (1000 * 60 * 60 * 24)
      );
      
      if (!stats[stage.stage]) {
        stats[stage.stage] = {
          count: 0,
          totalDays: 0,
          averageDays: 0
        };
      }
      
      stats[stage.stage].count++;
      stats[stage.stage].totalDays += duration;
      stats[stage.stage].averageDays = stats[stage.stage].totalDays / stats[stage.stage].count;
    });

    return stats;
  }, [stageHistory]);

  return {
    // State
    plant,
    currentStage,
    stageHistory,
    metrics,
    loading,
    error,
    notifications,

    // Computed
    stageProgress,
    expectedHarvestDate,
    availableActions,
    stageStatistics,

    // Actions
    transitionToStage,
    recordMetrics,
    addStageNote,
    dismissNotification,

    // Utilities
    LIFECYCLE_STAGES
  };
};
