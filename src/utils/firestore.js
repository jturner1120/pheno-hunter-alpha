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
  onSnapshot,
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

// Export the new service for lifecycle management
export const firestoreService = {
  // Document operations
  async getDocument(collection, id) {
    try {
      const docRef = doc(db, collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error(`Document ${id} not found in ${collection}`);
      }
    } catch (error) {
      logError(error, { operation: 'getDocument', collection, id });
      throw error;
    }
  },

  async updateDocument(collection, id, data) {
    try {
      const docRef = doc(db, collection, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      logInfo(`Document updated: ${collection}/${id}`);
    } catch (error) {
      logError(error, { operation: 'updateDocument', collection, id });
      throw error;
    }
  },

  // Subcollection operations
  async getSubcollection(parentCollection, parentId, subcollection) {
    try {
      const subcollectionRef = collection(db, parentCollection, parentId, subcollection);
      const querySnapshot = await getDocs(subcollectionRef);
      
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      return docs;
    } catch (error) {
      logError(error, { operation: 'getSubcollection', parentCollection, parentId, subcollection });
      throw error;
    }
  },

  async addToSubcollection(parentCollection, parentId, subcollection, data) {
    try {
      const subcollectionRef = collection(db, parentCollection, parentId, subcollection);
      const docRef = await addDoc(subcollectionRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      
      logInfo(`Document added to subcollection: ${parentCollection}/${parentId}/${subcollection}/${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logError(error, { operation: 'addToSubcollection', parentCollection, parentId, subcollection });
      throw error;
    }
  },

  // Collection subscription for real-time updates
  subscribeToCollection(collectionName, callback, constraints = []) {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;
      
      // Apply constraints if provided
      if (constraints.length > 0) {
        q = query(collectionRef, ...constraints);
      }
      
      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const docs = [];
          querySnapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() });
          });
          callback(docs, null);
        },
        (error) => {
          logError(error, { operation: 'subscribeToCollection', collectionName });
          callback(null, error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      logError(error, { operation: 'subscribeToCollection', collectionName });
      throw error;
    }
  },

  unsubscribe(unsubscribeFunction) {
    if (typeof unsubscribeFunction === 'function') {
      unsubscribeFunction();
    }
  }
};

/**
 * Get plant metrics for analytics
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of metrics
 */
export const getPlantMetrics = async (userId, options = {}) => {
  try {
    const startTime = performance.now();
    
    const { plantIds, startDate, endDate } = options;
    
    // If specific plants are requested, get metrics for each
    if (plantIds && plantIds.length > 0) {
      const allMetrics = [];
      
      for (const plantId of plantIds) {
        const metricsCollection = collection(db, 'users', userId, 'plants', plantId, 'metrics');
        let q = metricsCollection;
        
        const constraints = [orderBy('timestamp', 'asc')];
        
        if (startDate) {
          constraints.push(where('timestamp', '>=', startDate));
        }
        if (endDate) {
          constraints.push(where('timestamp', '<=', endDate));
        }
        
        if (constraints.length > 0) {
          q = query(metricsCollection, ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          allMetrics.push({
            id: doc.id,
            plantId,
            ...doc.data()
          });
        });
      }
      
      logPerformance('getPlantMetrics', performance.now() - startTime, { 
        userId, 
        plantCount: plantIds.length,
        metricsCount: allMetrics.length 
      });
      
      return allMetrics;
    }
    
    // Get metrics for all plants
    const plantsCollection = getUserPlantsCollection(userId);
    const plantsSnapshot = await getDocs(plantsCollection);
    const allMetrics = [];
    
    for (const plantDoc of plantsSnapshot.docs) {
      const plantId = plantDoc.id;
      const metricsCollection = collection(db, 'users', userId, 'plants', plantId, 'metrics');
      let q = metricsCollection;
      
      const constraints = [orderBy('timestamp', 'asc')];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      if (constraints.length > 0) {
        q = query(metricsCollection, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allMetrics.push({
          id: doc.id,
          plantId,
          ...doc.data()
        });
      });
    }
    
    logPerformance('getPlantMetrics', performance.now() - startTime, { 
      userId, 
      metricsCount: allMetrics.length 
    });
    
    return allMetrics;
  } catch (error) {
    logError(error, { operation: 'getPlantMetrics', userId, options });
    throw error;
  }
};

/**
 * Get plant timeline events for analytics
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of timeline events
 */
export const getPlantTimeline = async (userId, options = {}) => {
  try {
    const startTime = performance.now();
    
    const { plantIds, startDate, endDate } = options;
    
    // If specific plants are requested, get timeline for each
    if (plantIds && plantIds.length > 0) {
      const allEvents = [];
      
      for (const plantId of plantIds) {
        const timelineCollection = collection(db, 'users', userId, 'plants', plantId, 'timeline');
        let q = timelineCollection;
        
        const constraints = [orderBy('timestamp', 'desc')];
        
        if (startDate) {
          constraints.push(where('timestamp', '>=', startDate));
        }
        if (endDate) {
          constraints.push(where('timestamp', '<=', endDate));
        }
        
        if (constraints.length > 0) {
          q = query(timelineCollection, ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          allEvents.push({
            id: doc.id,
            plantId,
            ...doc.data()
          });
        });
      }
      
      logPerformance('getPlantTimeline', performance.now() - startTime, { 
        userId, 
        plantCount: plantIds.length,
        eventsCount: allEvents.length 
      });
      
      return allEvents;
    }
    
    // Get timeline events for all plants
    const plantsCollection = getUserPlantsCollection(userId);
    const plantsSnapshot = await getDocs(plantsCollection);
    const allEvents = [];
    
    for (const plantDoc of plantsSnapshot.docs) {
      const plantId = plantDoc.id;
      const timelineCollection = collection(db, 'users', userId, 'plants', plantId, 'timeline');
      let q = timelineCollection;
      
      const constraints = [orderBy('timestamp', 'desc')];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      if (constraints.length > 0) {
        q = query(timelineCollection, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allEvents.push({
          id: doc.id,
          plantId,
          ...doc.data()
        });
      });
    }
    
    logPerformance('getPlantTimeline', performance.now() - startTime, { 
      userId, 
      eventsCount: allEvents.length 
    });
    
    return allEvents;
  } catch (error) {
    logError(error, { operation: 'getPlantTimeline', userId, options });
    throw error;
  }
};

/**
 * Record plant metrics
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @param {Object} metrics - Metrics data
 * @returns {Promise<string>} - Created metrics record ID
 */
export const recordPlantMetrics = async (userId, plantId, metrics) => {
  try {
    const metricsCollection = collection(db, 'users', userId, 'plants', plantId, 'metrics');
    const metricsData = {
      ...metrics,
      timestamp: serverTimestamp(),
      recordedBy: userId
    };
    
    const docRef = await addDoc(metricsCollection, metricsData);
    
    logInfo(`Metrics recorded for plant ${plantId}`, { userId, plantId, metricsId: docRef.id });
    return docRef.id;
  } catch (error) {
    logError(error, { operation: 'recordPlantMetrics', userId, plantId });
    throw error;
  }
};

/**
 * Add timeline event
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @param {Object} event - Event data
 * @returns {Promise<string>} - Created event ID
 */
export const addTimelineEvent = async (userId, plantId, event) => {
  try {
    const timelineCollection = collection(db, 'users', userId, 'plants', plantId, 'timeline');
    const eventData = {
      ...event,
      timestamp: serverTimestamp(),
      userId
    };
    
    const docRef = await addDoc(timelineCollection, eventData);
    
    logInfo(`Timeline event added for plant ${plantId}`, { userId, plantId, eventId: docRef.id, type: event.type });
    return docRef.id;
  } catch (error) {
    logError(error, { operation: 'addTimelineEvent', userId, plantId });
    throw error;
  }
};
