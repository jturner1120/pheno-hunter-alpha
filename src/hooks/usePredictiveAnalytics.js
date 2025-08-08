// src/hooks/usePredictiveAnalytics.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getUserPlants, getPlantById, getPlantMetrics, getPlantTimeline } from '../utils/firestore';
import { 
  GrowthPredictionModel, 
  HarvestPredictionModel, 
  YieldPredictionModel 
} from '../utils/predictiveModels';
import { logInfo, logError, logPerformance } from '../utils/logger';

/**
 * Custom hook for predictive analytics functionality
 * @returns {Object} Predictive analytics state and functions
 */
export const usePredictiveAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState({
    growth: new GrowthPredictionModel(),
    harvest: new HarvestPredictionModel(),
    yield: new YieldPredictionModel()
  });
  const [modelsTrained, setModelsTrained] = useState({
    growth: false,
    harvest: false,
    yield: false
  });
  const [predictions, setPredictions] = useState({});
  const [lastTrainingDate, setLastTrainingDate] = useState(null);

  /**
   * Load and prepare training data
   */
  const loadTrainingData = useCallback(async () => {
    try {
      const plants = await getUserPlants(user.uid);
      const enhancedPlants = [];

      // Enhance plant data with metrics and timeline
      for (const plant of plants) {
        try {
          const metrics = await getPlantMetrics(user.uid, { plantIds: [plant.id] });
          const timeline = await getPlantTimeline(user.uid, { plantIds: [plant.id] });
          
          enhancedPlants.push({
            ...plant,
            metrics,
            timeline
          });
        } catch (error) {
          logError(error, { operation: 'loadTrainingData', plantId: plant.id });
          // Continue with other plants even if one fails
        }
      }

      return enhancedPlants;
    } catch (error) {
      logError(error, { operation: 'loadTrainingData' });
      throw error;
    }
  }, [user.uid]);

  /**
   * Train all prediction models
   */
  const trainModels = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      logInfo('Starting predictive models training');

      const trainingData = await loadTrainingData();
      const newModels = {
        growth: new GrowthPredictionModel(),
        harvest: new HarvestPredictionModel(),
        yield: new YieldPredictionModel()
      };
      const trainedStatus = { growth: false, harvest: false, yield: false };

      // Train growth prediction model
      try {
        const growthData = trainingData
          .filter(plant => plant.metrics && plant.metrics.length >= 3)
          .flatMap(plant => 
            plant.metrics.map(metric => ({
              ...metric,
              timestamp: metric.timestamp?.toDate?.() || new Date(metric.timestamp)
            }))
          );

        if (growthData.length >= 3) {
          newModels.growth.train(growthData);
          trainedStatus.growth = true;
          logInfo('Growth prediction model trained successfully');
        }
      } catch (error) {
        logError(error, { operation: 'trainGrowthModel' });
      }

      // Train harvest prediction model
      try {
        const harvestData = trainingData
          .filter(plant => plant.timeline && plant.timeline.length > 0)
          .map(plant => ({
            ...plant,
            timeline: plant.timeline.map(event => ({
              ...event,
              timestamp: event.timestamp?.toDate?.() || new Date(event.timestamp)
            }))
          }));

        if (harvestData.length >= 3) {
          newModels.harvest.train(harvestData);
          trainedStatus.harvest = true;
          logInfo('Harvest prediction model trained successfully');
        }
      } catch (error) {
        logError(error, { operation: 'trainHarvestModel' });
      }

      // Train yield prediction model
      try {
        const yieldData = trainingData.filter(plant => 
          plant.yield && plant.yield > 0
        );

        if (yieldData.length >= 5) {
          newModels.yield.train(yieldData);
          trainedStatus.yield = true;
          logInfo('Yield prediction model trained successfully');
        }
      } catch (error) {
        logError(error, { operation: 'trainYieldModel' });
      }

      setModels(newModels);
      setModelsTrained(trainedStatus);
      setLastTrainingDate(new Date());

      const duration = performance.now() - startTime;
      logPerformance('trainModels', duration, {
        plantsAnalyzed: trainingData.length,
        modelsSuccess: Object.values(trainedStatus).filter(Boolean).length
      });

      logInfo(`Models training completed. Success: ${Object.values(trainedStatus).filter(Boolean).length}/3`);

    } catch (error) {
      logError(error, { operation: 'trainModels' });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, loadTrainingData]);

  /**
   * Generate predictions for a specific plant
   */
  const generatePlantPredictions = useCallback(async (plantId) => {
    try {
      const plant = await getPlantById(user.uid, plantId);
      const metrics = await getPlantMetrics(user.uid, { plantIds: [plantId] });
      const timeline = await getPlantTimeline(user.uid, { plantIds: [plantId] });

      const enhancedPlant = {
        ...plant,
        metrics,
        timeline: timeline.map(event => ({
          ...event,
          timestamp: event.timestamp?.toDate?.() || new Date(event.timestamp)
        }))
      };

      const plantPredictions = {};

      // Growth predictions
      if (modelsTrained.growth && metrics.length >= 2) {
        try {
          const metricsWithDates = metrics.map(metric => ({
            ...metric,
            timestamp: metric.timestamp?.toDate?.() || new Date(metric.timestamp)
          }));
          
          models.growth.train(metricsWithDates);
          
          // Predict for next 7, 14, and 30 days
          plantPredictions.growth = {
            next7Days: models.growth.predict(7),
            next14Days: models.growth.predict(14),
            next30Days: models.growth.predict(30),
            growthRates: models.growth.getGrowthRates()
          };
        } catch (error) {
          logError(error, { operation: 'generateGrowthPrediction', plantId });
        }
      }

      // Harvest predictions
      if (modelsTrained.harvest && enhancedPlant.stage !== 'harvest') {
        try {
          plantPredictions.harvest = models.harvest.predict(enhancedPlant);
        } catch (error) {
          logError(error, { operation: 'generateHarvestPrediction', plantId });
        }
      }

      // Yield predictions
      if (modelsTrained.yield && models.yield.hasRequiredFeatures(enhancedPlant)) {
        try {
          plantPredictions.yield = models.yield.predict(enhancedPlant);
        } catch (error) {
          logError(error, { operation: 'generateYieldPrediction', plantId });
        }
      }

      // Problem detection
      plantPredictions.problems = detectPotentialProblems(enhancedPlant, plantPredictions);

      setPredictions(prev => ({
        ...prev,
        [plantId]: {
          ...plantPredictions,
          generatedAt: new Date(),
          plantSnapshot: {
            id: plant.id,
            name: plant.name,
            stage: plant.stage,
            health: plant.health
          }
        }
      }));

      return plantPredictions;

    } catch (error) {
      logError(error, { operation: 'generatePlantPredictions', plantId });
      throw error;
    }
  }, [user.uid, models, modelsTrained]);

  /**
   * Generate predictions for all active plants
   */
  const generateAllPredictions = useCallback(async () => {
    try {
      const plants = await getUserPlants(user.uid);
      const activePlants = plants.filter(plant => 
        plant.status === 'active' || plant.status === 'growing'
      );

      const predictions = {};
      for (const plant of activePlants) {
        try {
          predictions[plant.id] = await generatePlantPredictions(plant.id);
        } catch (error) {
          logError(error, { operation: 'generateAllPredictions', plantId: plant.id });
          // Continue with other plants
        }
      }

      return predictions;
    } catch (error) {
      logError(error, { operation: 'generateAllPredictions' });
      throw error;
    }
  }, [user.uid, generatePlantPredictions]);

  /**
   * Get recommendations based on predictions
   */
  const getRecommendations = useCallback((plantId) => {
    const plantPredictions = predictions[plantId];
    if (!plantPredictions) return [];

    const recommendations = [];

    // Growth-based recommendations
    if (plantPredictions.growth) {
      const { growthRates } = plantPredictions.growth;
      
      if (growthRates.heightPerDay < 0.5) {
        recommendations.push({
          type: 'growth',
          priority: 'medium',
          message: 'Growth rate is below optimal. Consider checking lighting and nutrients.',
          action: 'review_environment'
        });
      }

      if (growthRates.heightPerDay > 5) {
        recommendations.push({
          type: 'growth',
          priority: 'low',
          message: 'Excellent growth rate! Current conditions are optimal.',
          action: 'maintain_conditions'
        });
      }
    }

    // Harvest-based recommendations
    if (plantPredictions.harvest) {
      const { daysRemaining, confidence } = plantPredictions.harvest;
      
      if (daysRemaining <= 7) {
        recommendations.push({
          type: 'harvest',
          priority: 'high',
          message: `Harvest predicted within ${daysRemaining} days. Prepare for harvest.`,
          action: 'prepare_harvest'
        });
      } else if (daysRemaining <= 14) {
        recommendations.push({
          type: 'harvest',
          priority: 'medium',
          message: `Harvest approaching in ${daysRemaining} days. Monitor trichomes closely.`,
          action: 'monitor_harvest_indicators'
        });
      }

      if (confidence < 0.5) {
        recommendations.push({
          type: 'harvest',
          priority: 'low',
          message: 'Harvest prediction has low confidence. More data needed for accuracy.',
          action: 'collect_more_data'
        });
      }
    }

    // Problem-based recommendations
    if (plantPredictions.problems) {
      plantPredictions.problems.forEach(problem => {
        recommendations.push({
          type: 'problem',
          priority: problem.severity,
          message: problem.description,
          action: problem.recommendedAction
        });
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [predictions]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if models need retraining
   */
  const needsRetraining = useMemo(() => {
    if (!lastTrainingDate) return true;
    
    const daysSinceTraining = (new Date() - lastTrainingDate) / (1000 * 60 * 60 * 24);
    return daysSinceTraining > 7; // Retrain weekly
  }, [lastTrainingDate]);

  /**
   * Auto-train models on mount and when needed
   */
  useEffect(() => {
    if (user && needsRetraining) {
      trainModels();
    }
  }, [user, needsRetraining, trainModels]);

  // Computed values
  const anyModelTrained = Object.values(modelsTrained).some(Boolean);
  const allModelsTrained = Object.values(modelsTrained).every(Boolean);
  const trainingProgress = Object.values(modelsTrained).filter(Boolean).length / 3;

  return {
    // State
    loading,
    error,
    predictions,
    modelsTrained,
    lastTrainingDate,
    
    // Actions
    trainModels,
    generatePlantPredictions,
    generateAllPredictions,
    getRecommendations,
    clearError,
    
    // Computed values
    anyModelTrained,
    allModelsTrained,
    trainingProgress,
    needsRetraining,
    
    // Model access
    models
  };
};

/**
 * Detect potential problems based on plant data and predictions
 * @param {Object} plant - Plant data
 * @param {Object} predictions - Plant predictions
 * @returns {Array} - Array of potential problems
 */
function detectPotentialProblems(plant, predictions) {
  const problems = [];

  // Growth problems
  if (predictions.growth) {
    const { growthRates } = predictions.growth;
    
    if (growthRates.heightPerDay < 0.1) {
      problems.push({
        type: 'growth_stagnation',
        severity: 'high',
        description: 'Plant growth has significantly slowed or stopped',
        recommendedAction: 'check_nutrients_and_lighting'
      });
    }

    if (growthRates.widthPerDay < 0.05 && plant.stage === 'vegetative') {
      problems.push({
        type: 'poor_bushing',
        severity: 'medium',
        description: 'Plant is not developing width as expected during vegetative stage',
        recommendedAction: 'consider_training_techniques'
      });
    }
  }

  // Health problems
  if (plant.health) {
    const healthScore = typeof plant.health === 'number' 
      ? plant.health 
      : getHealthScore(plant.health);

    if (healthScore < 60) {
      problems.push({
        type: 'health_decline',
        severity: 'high',
        description: 'Plant health is below acceptable levels',
        recommendedAction: 'investigate_health_issues'
      });
    }
  }

  // Stage progression problems
  if (plant.stageStartDate) {
    const daysSinceStageStart = (new Date() - plant.stageStartDate) / (1000 * 60 * 60 * 24);
    
    if (plant.stage === 'seedling' && daysSinceStageStart > 21) {
      problems.push({
        type: 'delayed_development',
        severity: 'medium',
        description: 'Plant has been in seedling stage longer than typical',
        recommendedAction: 'evaluate_growing_conditions'
      });
    }
  }

  return problems;
}

/**
 * Convert health status to numeric score
 * @param {string} health - Health status
 * @returns {number} - Health score (0-100)
 */
function getHealthScore(health) {
  const healthMap = {
    'excellent': 95,
    'good': 80,
    'fair': 60,
    'poor': 40,
    'critical': 20
  };

  return healthMap[health?.toLowerCase()] || 60;
}

export default usePredictiveAnalytics;
