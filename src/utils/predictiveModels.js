// src/utils/predictiveModels.js
import { SimpleLinearRegression, PolynomialRegression } from 'ml-regression';
import { logInfo, logError, logPerformance } from './logger';

/**
 * Growth prediction model using linear regression
 */
export class GrowthPredictionModel {
  constructor() {
    this.heightModel = null;
    this.widthModel = null;
    this.trained = false;
  }

  /**
   * Train the model with historical growth data
   * @param {Array} data - Array of growth measurements with timestamps
   */
  train(data) {
    try {
      const startTime = performance.now();

      if (!data || data.length < 3) {
        throw new Error('Insufficient data for training (minimum 3 data points required)');
      }

      // Prepare training data
      const heightData = [];
      const widthData = [];
      const baseTime = data[0].timestamp;

      data.forEach(point => {
        const daysSinceStart = (point.timestamp - baseTime) / (1000 * 60 * 60 * 24);
        if (point.height !== undefined && point.height > 0) {
          heightData.push([daysSinceStart, point.height]);
        }
        if (point.width !== undefined && point.width > 0) {
          widthData.push([daysSinceStart, point.width]);
        }
      });

      // Train height model
      if (heightData.length >= 3) {
        const heightX = heightData.map(d => d[0]);
        const heightY = heightData.map(d => d[1]);
        this.heightModel = new SimpleLinearRegression(heightX, heightY);
      }

      // Train width model
      if (widthData.length >= 3) {
        const widthX = widthData.map(d => d[0]);
        const widthY = widthData.map(d => d[1]);
        this.widthModel = new SimpleLinearRegression(widthX, widthY);
      }

      this.trained = true;
      this.baseTime = baseTime;

      const duration = performance.now() - startTime;
      logPerformance('GrowthPredictionModel.train', duration, {
        dataPoints: data.length,
        heightModelTrained: !!this.heightModel,
        widthModelTrained: !!this.widthModel
      });

      logInfo('Growth prediction model trained successfully');
    } catch (error) {
      logError(error, { operation: 'GrowthPredictionModel.train', dataLength: data?.length });
      throw error;
    }
  }

  /**
   * Predict growth for future dates
   * @param {number} daysInFuture - Number of days to predict into the future
   * @returns {Object} - Predicted height and width
   */
  predict(daysInFuture) {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }

    try {
      const predictions = {};

      if (this.heightModel) {
        const predictedHeight = this.heightModel.predict(daysInFuture);
        predictions.height = Math.max(0, predictedHeight); // Ensure non-negative
      }

      if (this.widthModel) {
        const predictedWidth = this.widthModel.predict(daysInFuture);
        predictions.width = Math.max(0, predictedWidth); // Ensure non-negative
      }

      // Calculate confidence based on R-squared
      predictions.confidence = this.getConfidence();

      return predictions;
    } catch (error) {
      logError(error, { operation: 'GrowthPredictionModel.predict', daysInFuture });
      throw error;
    }
  }

  /**
   * Get model confidence score
   * @returns {number} - Confidence score between 0 and 1
   */
  getConfidence() {
    let totalR2 = 0;
    let modelCount = 0;

    if (this.heightModel) {
      totalR2 += this.heightModel.score || 0;
      modelCount++;
    }

    if (this.widthModel) {
      totalR2 += this.widthModel.score || 0;
      modelCount++;
    }

    return modelCount > 0 ? Math.max(0, Math.min(1, totalR2 / modelCount)) : 0;
  }

  /**
   * Get growth rate predictions
   * @returns {Object} - Growth rates in units per day
   */
  getGrowthRates() {
    const rates = {};

    if (this.heightModel) {
      rates.heightPerDay = this.heightModel.slope || 0;
    }

    if (this.widthModel) {
      rates.widthPerDay = this.widthModel.slope || 0;
    }

    return rates;
  }
}

/**
 * Harvest timing prediction model
 */
export class HarvestPredictionModel {
  constructor() {
    this.stageTransitions = new Map();
    this.trained = false;
  }

  /**
   * Train with historical stage transition data
   * @param {Array} plants - Array of plant data with stage transitions
   */
  train(plants) {
    try {
      const startTime = performance.now();

      if (!plants || plants.length === 0) {
        throw new Error('No plant data provided for training');
      }

      // Analyze stage transitions
      const transitions = {
        'seedling_to_vegetative': [],
        'vegetative_to_flowering': [],
        'flowering_to_harvest': []
      };

      plants.forEach(plant => {
        if (plant.timeline) {
          const stages = plant.timeline
            .filter(event => event.type === 'stage_change')
            .sort((a, b) => a.timestamp - b.timestamp);

          for (let i = 0; i < stages.length - 1; i++) {
            const currentStage = stages[i].stage;
            const nextStage = stages[i + 1].stage;
            const duration = (stages[i + 1].timestamp - stages[i].timestamp) / (1000 * 60 * 60 * 24);

            const transitionKey = `${currentStage}_to_${nextStage}`;
            if (transitions[transitionKey]) {
              transitions[transitionKey].push(duration);
            }
          }
        }
      });

      // Calculate average durations
      Object.entries(transitions).forEach(([key, durations]) => {
        if (durations.length > 0) {
          const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
          const variance = durations.reduce((sum, d) => sum + Math.pow(d - average, 2), 0) / durations.length;
          
          this.stageTransitions.set(key, {
            average,
            variance,
            sampleSize: durations.length,
            confidence: Math.min(0.95, durations.length / 10) // Higher confidence with more samples
          });
        }
      });

      this.trained = true;

      const duration = performance.now() - startTime;
      logPerformance('HarvestPredictionModel.train', duration, {
        plantsAnalyzed: plants.length,
        transitionsFound: this.stageTransitions.size
      });

      logInfo('Harvest prediction model trained successfully');
    } catch (error) {
      logError(error, { operation: 'HarvestPredictionModel.train', plantsCount: plants?.length });
      throw error;
    }
  }

  /**
   * Predict harvest date for a plant
   * @param {Object} plant - Plant data
   * @returns {Object} - Harvest prediction with confidence
   */
  predict(plant) {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }

    try {
      const currentStage = plant.stage;
      const stageStartDate = plant.stageStartDate || plant.createdAt;
      const daysSinceStageStart = (new Date() - stageStartDate) / (1000 * 60 * 60 * 24);

      let totalDaysRemaining = 0;
      let overallConfidence = 1;

      // Predict remaining time in current stage
      if (currentStage !== 'harvest') {
        const nextStage = this.getNextStage(currentStage);
        const transitionKey = `${currentStage}_to_${nextStage}`;
        const transition = this.stageTransitions.get(transitionKey);

        if (transition) {
          const expectedStageDuration = transition.average;
          const remainingInStage = Math.max(0, expectedStageDuration - daysSinceStageStart);
          totalDaysRemaining += remainingInStage;
          overallConfidence *= transition.confidence;

          // Add time for subsequent stages
          if (nextStage !== 'harvest') {
            const subsequentStages = this.getSubsequentStages(nextStage);
            subsequentStages.forEach(stage => {
              const subsequentTransition = this.stageTransitions.get(`${stage.from}_to_${stage.to}`);
              if (subsequentTransition) {
                totalDaysRemaining += subsequentTransition.average;
                overallConfidence *= subsequentTransition.confidence;
              }
            });
          }
        }
      }

      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + totalDaysRemaining);

      return {
        harvestDate,
        daysRemaining: Math.round(totalDaysRemaining),
        confidence: overallConfidence,
        currentStage,
        stageProgress: this.calculateStageProgress(plant)
      };
    } catch (error) {
      logError(error, { operation: 'HarvestPredictionModel.predict', plantId: plant.id });
      throw error;
    }
  }

  /**
   * Get next stage in growth cycle
   * @param {string} currentStage - Current growth stage
   * @returns {string} - Next stage
   */
  getNextStage(currentStage) {
    const stageProgression = {
      'seedling': 'vegetative',
      'vegetative': 'flowering',
      'flowering': 'harvest'
    };

    return stageProgression[currentStage] || 'harvest';
  }

  /**
   * Get all subsequent stages until harvest
   * @param {string} startStage - Starting stage
   * @returns {Array} - Array of stage transitions
   */
  getSubsequentStages(startStage) {
    const transitions = [];
    let currentStage = startStage;

    while (currentStage !== 'harvest') {
      const nextStage = this.getNextStage(currentStage);
      transitions.push({ from: currentStage, to: nextStage });
      currentStage = nextStage;
    }

    return transitions;
  }

  /**
   * Calculate progress through current stage
   * @param {Object} plant - Plant data
   * @returns {number} - Progress percentage (0-100)
   */
  calculateStageProgress(plant) {
    const currentStage = plant.stage;
    const stageStartDate = plant.stageStartDate || plant.createdAt;
    const daysSinceStageStart = (new Date() - stageStartDate) / (1000 * 60 * 60 * 24);

    const nextStage = this.getNextStage(currentStage);
    const transitionKey = `${currentStage}_to_${nextStage}`;
    const transition = this.stageTransitions.get(transitionKey);

    if (transition) {
      const progress = (daysSinceStageStart / transition.average) * 100;
      return Math.min(100, Math.max(0, progress));
    }

    return 0;
  }
}

/**
 * Yield prediction model
 */
export class YieldPredictionModel {
  constructor() {
    this.model = null;
    this.trained = false;
    this.features = ['height', 'width', 'daysInFlowering', 'health'];
  }

  /**
   * Train with historical yield data
   * @param {Array} plants - Plants with yield data
   */
  train(plants) {
    try {
      const startTime = performance.now();

      const plantsWithYield = plants.filter(plant => 
        plant.yield && plant.yield > 0 && this.hasRequiredFeatures(plant)
      );

      if (plantsWithYield.length < 5) {
        throw new Error('Insufficient yield data for training (minimum 5 plants required)');
      }

      // Prepare training data
      const X = plantsWithYield.map(plant => this.extractFeatures(plant));
      const Y = plantsWithYield.map(plant => plant.yield);

      // Use polynomial regression for better yield prediction
      this.model = new PolynomialRegression(X, Y, 2);
      this.trained = true;

      const duration = performance.now() - startTime;
      logPerformance('YieldPredictionModel.train', duration, {
        plantsWithYield: plantsWithYield.length,
        totalPlants: plants.length
      });

      logInfo('Yield prediction model trained successfully');
    } catch (error) {
      logError(error, { operation: 'YieldPredictionModel.train', plantsCount: plants?.length });
      throw error;
    }
  }

  /**
   * Predict yield for a plant
   * @param {Object} plant - Plant data
   * @returns {Object} - Yield prediction
   */
  predict(plant) {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }

    if (!this.hasRequiredFeatures(plant)) {
      throw new Error('Plant is missing required features for yield prediction');
    }

    try {
      const features = this.extractFeatures(plant);
      const predictedYield = this.model.predict([features])[0];

      return {
        predictedYield: Math.max(0, predictedYield),
        confidence: this.getYieldConfidence(plant),
        factors: this.getYieldFactors(plant)
      };
    } catch (error) {
      logError(error, { operation: 'YieldPredictionModel.predict', plantId: plant.id });
      throw error;
    }
  }

  /**
   * Check if plant has required features
   * @param {Object} plant - Plant data
   * @returns {boolean} - Has required features
   */
  hasRequiredFeatures(plant) {
    return this.features.every(feature => {
      switch (feature) {
        case 'height':
        case 'width':
          return plant[feature] !== undefined && plant[feature] > 0;
        case 'daysInFlowering':
          return plant.stage === 'flowering' || plant.harvestedAt;
        case 'health':
          return plant.health !== undefined;
        default:
          return true;
      }
    });
  }

  /**
   * Extract features for prediction
   * @param {Object} plant - Plant data
   * @returns {Array} - Feature vector
   */
  extractFeatures(plant) {
    const daysInFlowering = this.calculateDaysInFlowering(plant);
    const healthScore = this.normalizeHealth(plant.health);

    return [
      plant.height || 0,
      plant.width || 0,
      daysInFlowering,
      healthScore
    ];
  }

  /**
   * Calculate days in flowering stage
   * @param {Object} plant - Plant data
   * @returns {number} - Days in flowering
   */
  calculateDaysInFlowering(plant) {
    if (plant.stage === 'flowering') {
      const floweringStart = plant.stageStartDate || plant.createdAt;
      return (new Date() - floweringStart) / (1000 * 60 * 60 * 24);
    } else if (plant.harvestedAt && plant.floweringStartDate) {
      return (plant.harvestedAt - plant.floweringStartDate) / (1000 * 60 * 60 * 24);
    }
    return 0;
  }

  /**
   * Normalize health score to 0-1 range
   * @param {string|number} health - Health status
   * @returns {number} - Normalized health score
   */
  normalizeHealth(health) {
    if (typeof health === 'number') {
      return Math.max(0, Math.min(1, health / 100));
    }

    const healthMap = {
      'excellent': 1.0,
      'good': 0.8,
      'fair': 0.6,
      'poor': 0.4,
      'critical': 0.2
    };

    return healthMap[health?.toLowerCase()] || 0.6;
  }

  /**
   * Get yield confidence based on plant characteristics
   * @param {Object} plant - Plant data
   * @returns {number} - Confidence score
   */
  getYieldConfidence(plant) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on plant maturity
    if (plant.stage === 'flowering') confidence += 0.3;
    if (plant.stage === 'harvest') confidence += 0.4;

    // Increase confidence based on health
    const healthScore = this.normalizeHealth(plant.health);
    confidence += healthScore * 0.2;

    return Math.min(1, confidence);
  }

  /**
   * Get factors affecting yield
   * @param {Object} plant - Plant data
   * @returns {Object} - Yield affecting factors
   */
  getYieldFactors(plant) {
    return {
      size: `${plant.height || 0}cm x ${plant.width || 0}cm`,
      health: plant.health || 'Unknown',
      stage: plant.stage || 'Unknown',
      strain: plant.strain || 'Unknown'
    };
  }
}

export default {
  GrowthPredictionModel,
  HarvestPredictionModel,
  YieldPredictionModel
};
