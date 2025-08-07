// Firebase Firestore utilities for plant data management
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logInfo, logError, logPerformance } from './logger';

/**
 * Get user's plants collection reference
 * @param {string} userId - User ID
 * @returns {CollectionReference} - Plants collection reference
 */
const getUserPlantsCollection = (userId) => {
  return collection(db, 'users', userId, 'plants');
};

/**
 * Get a specific plant document reference
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @returns {DocumentReference} - Plant document reference
 */
const getPlantDoc = (userId, plantId) => {
  return doc(db, 'users', userId, 'plants', plantId);
};

/**
 * Create a new plant for a user
 * @param {string} userId - User ID
 * @param {Object} plantData - Plant data object
 * @returns {Promise<string>} - Created plant ID
 */
export const createPlant = async (userId, plantData) => {
  try {
    const startTime = performance.now();
    
    const plantsCollection = getUserPlantsCollection(userId);
    const plantWithTimestamp = {
      ...plantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    };
    
    const docRef = await addDoc(plantsCollection, plantWithTimestamp);
    
    const duration = performance.now() - startTime;
    logPerformance('createPlant', duration, { userId, plantId: docRef.id });
    logInfo('Plant created successfully', { userId, plantId: docRef.id, strain: plantData.strain });
    
    return docRef.id;
  } catch (error) {
    logError(error, { operation: 'createPlant', userId, plantData });
    throw new Error(`Failed to create plant: ${error.message}`);
  }
};

/**
 * Get all plants for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of plant objects with IDs
 */
export const getUserPlants = async (userId) => {
  try {
    const startTime = performance.now();
    
    const plantsCollection = getUserPlantsCollection(userId);
    const q = query(plantsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const plants = [];
    querySnapshot.forEach((doc) => {
      plants.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const duration = performance.now() - startTime;
    logPerformance('getUserPlants', duration, { userId, plantCount: plants.length });
    logInfo('Plants retrieved successfully', { userId, count: plants.length });
    
    return plants;
  } catch (error) {
    logError(error, { operation: 'getUserPlants', userId });
    throw new Error(`Failed to get plants: ${error.message}`);
  }
};

/**
 * Get a specific plant by ID
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @returns {Promise<Object|null>} - Plant object with ID or null if not found
 */
export const getPlantById = async (userId, plantId) => {
  try {
    const startTime = performance.now();
    
    const plantDocRef = getPlantDoc(userId, plantId);
    const docSnap = await getDoc(plantDocRef);
    
    const duration = performance.now() - startTime;
    logPerformance('getPlantById', duration, { userId, plantId });
    
    if (docSnap.exists()) {
      const plant = {
        id: docSnap.id,
        ...docSnap.data()
      };
      logInfo('Plant retrieved successfully', { userId, plantId, strain: plant.strain });
      return plant;
    } else {
      logInfo('Plant not found', { userId, plantId });
      return null;
    }
  } catch (error) {
    logError(error, { operation: 'getPlantById', userId, plantId });
    throw new Error(`Failed to get plant: ${error.message}`);
  }
};

/**
 * Update a plant
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updatePlant = async (userId, plantId, updateData) => {
  try {
    const startTime = performance.now();
    
    const plantDocRef = getPlantDoc(userId, plantId);
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(plantDocRef, dataWithTimestamp);
    
    const duration = performance.now() - startTime;
    logPerformance('updatePlant', duration, { userId, plantId });
    logInfo('Plant updated successfully', { userId, plantId, updateFields: Object.keys(updateData) });
    
  } catch (error) {
    logError(error, { operation: 'updatePlant', userId, plantId, updateData });
    throw new Error(`Failed to update plant: ${error.message}`);
  }
};

/**
 * Delete a plant
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @returns {Promise<void>}
 */
export const deletePlant = async (userId, plantId) => {
  try {
    const startTime = performance.now();
    
    const plantDocRef = getPlantDoc(userId, plantId);
    await deleteDoc(plantDocRef);
    
    const duration = performance.now() - startTime;
    logPerformance('deletePlant', duration, { userId, plantId });
    logInfo('Plant deleted successfully', { userId, plantId });
    
  } catch (error) {
    logError(error, { operation: 'deletePlant', userId, plantId });
    throw new Error(`Failed to delete plant: ${error.message}`);
  }
};

/**
 * Add a harvest record to a plant
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @param {Object} harvestData - Harvest data
 * @returns {Promise<void>}
 */
export const addHarvestRecord = async (userId, plantId, harvestData) => {
  try {
    const startTime = performance.now();
    
    // Get current plant data
    const plant = await getPlantById(userId, plantId);
    if (!plant) {
      throw new Error('Plant not found');
    }
    
    // Add harvest to plant's harvest history
    const updatedHarvests = [
      ...(plant.harvests || []),
      {
        ...harvestData,
        harvestDate: serverTimestamp(),
        id: `harvest_${Date.now()}`
      }
    ];
    
    // Update plant with new harvest and status
    await updatePlant(userId, plantId, {
      harvests: updatedHarvests,
      status: 'harvested',
      harvestDate: serverTimestamp()
    });
    
    const duration = performance.now() - startTime;
    logPerformance('addHarvestRecord', duration, { userId, plantId });
    logInfo('Harvest record added successfully', { 
      userId, 
      plantId, 
      harvestWeight: harvestData.weight,
      harvestQuality: harvestData.quality 
    });
    
  } catch (error) {
    logError(error, { operation: 'addHarvestRecord', userId, plantId, harvestData });
    throw new Error(`Failed to add harvest record: ${error.message}`);
  }
};

/**
 * Clone a plant (create a new plant based on existing one)
 * @param {string} userId - User ID
 * @param {string} parentPlantId - Parent plant ID
 * @param {Object} cloneData - Additional clone data
 * @returns {Promise<string>} - New plant ID
 */
export const clonePlant = async (userId, parentPlantId, cloneData = {}) => {
  try {
    const startTime = performance.now();
    
    // Get parent plant data
    const parentPlant = await getPlantById(userId, parentPlantId);
    if (!parentPlant) {
      throw new Error('Parent plant not found');
    }
    
    // Create clone data
    const cloneDataToSave = {
      strain: parentPlant.strain,
      genetics: parentPlant.genetics,
      environment: parentPlant.environment,
      nutrients: parentPlant.nutrients,
      status: 'seedling',
      parentPlantId: parentPlantId,
      isClone: true,
      cloneGeneration: (parentPlant.cloneGeneration || 0) + 1,
      ...cloneData,
      plantedDate: serverTimestamp()
    };
    
    const newPlantId = await createPlant(userId, cloneDataToSave);
    
    const duration = performance.now() - startTime;
    logPerformance('clonePlant', duration, { userId, parentPlantId, newPlantId });
    logInfo('Plant cloned successfully', { 
      userId, 
      parentPlantId, 
      newPlantId,
      strain: parentPlant.strain 
    });
    
    return newPlantId;
  } catch (error) {
    logError(error, { operation: 'clonePlant', userId, parentPlantId, cloneData });
    throw new Error(`Failed to clone plant: ${error.message}`);
  }
};

/**
 * Get plant statistics for dashboard
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Plant statistics
 */
export const getPlantStats = async (userId) => {
  try {
    const plants = await getUserPlants(userId);
    
    const stats = {
      totalPlants: plants.length,
      activePlants: plants.filter(p => p.status === 'vegetative' || p.status === 'flowering').length,
      harvestedPlants: plants.filter(p => p.status === 'harvested').length,
      totalClones: plants.filter(p => p.isClone).length,
      strainCount: new Set(plants.map(p => p.strain)).size,
      averageGrowTime: 0,
      totalHarvestWeight: 0
    };
    
    // Calculate average grow time for harvested plants
    const harvestedPlants = plants.filter(p => p.status === 'harvested' && p.plantedDate && p.harvestDate);
    if (harvestedPlants.length > 0) {
      const totalGrowTime = harvestedPlants.reduce((sum, plant) => {
        const plantedDate = plant.plantedDate.toDate ? plant.plantedDate.toDate() : new Date(plant.plantedDate);
        const harvestDate = plant.harvestDate.toDate ? plant.harvestDate.toDate() : new Date(plant.harvestDate);
        return sum + (harvestDate - plantedDate);
      }, 0);
      stats.averageGrowTime = Math.round(totalGrowTime / harvestedPlants.length / (1000 * 60 * 60 * 24)); // days
    }
    
    // Calculate total harvest weight
    plants.forEach(plant => {
      if (plant.harvests && plant.harvests.length > 0) {
        plant.harvests.forEach(harvest => {
          if (harvest.weight) {
            stats.totalHarvestWeight += parseFloat(harvest.weight) || 0;
          }
        });
      }
    });
    
    logInfo('Plant statistics calculated', { userId, stats });
    return stats;
  } catch (error) {
    logError(error, { operation: 'getPlantStats', userId });
    throw new Error(`Failed to get plant statistics: ${error.message}`);
  }
};

export default {
  createPlant,
  getUserPlants,
  getPlantById,
  updatePlant,
  deletePlant,
  addHarvestRecord,
  clonePlant,
  getPlantStats
};
