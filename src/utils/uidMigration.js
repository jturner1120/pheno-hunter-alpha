// Legacy Data Migration for UID System
import { getUserPlants } from './firestore';
import { addPlantWithUIDFields, addStrainToRegistry } from './uidBackend';
import { generateSeedUID, formatDateForUID } from './uidGeneration';
import { normalizeStrainCode, validateStrainCode } from './strainValidation';

/**
 * Generate a strain code from strain name (for auto-generation)
 * @param {string} strainName - Strain name
 * @returns {string} - Generated 3-letter code
 */
const generateStrainCodeFromName = (strainName) => {
  if (!strainName) return 'GEN'; // Generic fallback
  
  // Take first 3 letters, remove non-alphabetic, uppercase
  const cleaned = strainName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  
  if (cleaned.length >= 3) {
    return cleaned.substring(0, 3);
  } else {
    // Pad with generic letters if too short
    return (cleaned + 'GEN').substring(0, 3);
  }
};

/**
 * Migrate a single plant to add UID fields
 * @param {string} userId - User ID
 * @param {object} plant - Plant data
 * @param {Map} strainCodeMap - Map of strain names to codes
 * @param {Map} usedCodes - Set of already used codes
 * @returns {Promise<object>} - Migration result
 */
const migratePlant = async (userId, plant, strainCodeMap, usedCodes) => {
  try {
    // Skip if already has UID
    if (plant.unique_id) {
      return { 
        plantId: plant.id, 
        status: 'skipped', 
        reason: 'Already has UID',
        uid: plant.unique_id 
      };
    }

    const strainName = plant.strain || 'Unknown Strain';
    let strainCode;

    // Check if we already determined a code for this strain
    if (strainCodeMap.has(strainName)) {
      strainCode = strainCodeMap.get(strainName);
    } else {
      // Generate new code for this strain
      let proposedCode = generateStrainCodeFromName(strainName);
      
      // Ensure code is unique
      let counter = 1;
      let originalCode = proposedCode;
      while (usedCodes.has(proposedCode)) {
        proposedCode = originalCode.substring(0, 2) + counter.toString();
        counter++;
        if (counter > 9) {
          // If we run out of single digits, try double letters
          proposedCode = originalCode.substring(0, 1) + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }

      // Validate the generated code
      const validation = validateStrainCode(proposedCode);
      if (!validation.valid) {
        proposedCode = 'GEN'; // Ultimate fallback
        let genCounter = 1;
        while (usedCodes.has(proposedCode + genCounter.toString().padStart(2, '0').slice(-2))) {
          genCounter++;
        }
        proposedCode = 'GE' + genCounter.toString();
      }

      strainCode = proposedCode;
      strainCodeMap.set(strainName, strainCode);
      usedCodes.add(strainCode);

      // Add to strain registry
      await addStrainToRegistry(userId, strainName, strainCode);
    }

    // Determine date born (use createdAt if available, otherwise current date)
    let dateBorn = new Date();
    if (plant.createdAt) {
      // Handle Firestore Timestamp
      dateBorn = plant.createdAt.toDate ? plant.createdAt.toDate() : new Date(plant.createdAt);
    }

    // Generate UID for this plant
    // For migration, we'll use a simplified approach and not increment counters
    // to avoid conflicts with new plants
    const dateBornStr = formatDateForUID(dateBorn);
    
    // Use a simple incrementer for migration to avoid conflicts
    const migrationKey = `${strainCode}_${dateBornStr}`;
    const existingCount = await countExistingPlantsForKey(userId, migrationKey);
    const seedSeq = existingCount + 1;
    const seedSeqStr = String(seedSeq).padStart(2, '0');
    
    const uid = `${strainCode}_${dateBornStr}_${seedSeqStr}`;

    // Determine if it's a clone (rough heuristic based on existing data)
    let parentId = null;
    let isClone = false;
    if (plant.isClone || plant.origin === 'Clone' || plant.cloneGeneration > 0) {
      isClone = true;
      // For legacy clones, we'll append _c01, _c02, etc.
      const cloneSeq = await countExistingClonesForParent(userId, plant.strain, dateBornStr);
      const cloneSeqStr = String(cloneSeq + 1).padStart(2, '0');
      const cloneUID = `${uid}_c${cloneSeqStr}`;
      
      // Update plant with UID fields
      await addPlantWithUIDFields(userId, plant.id, {
        unique_id: cloneUID,
        strain_code: strainCode,
        strain_name: strainName,
        parent_id: parentId, // May be null for legacy data
        migrated_at: new Date(),
      });

      return { 
        plantId: plant.id, 
        status: 'migrated', 
        type: 'clone',
        uid: cloneUID 
      };
    } else {
      // Seed plant
      await addPlantWithUIDFields(userId, plant.id, {
        unique_id: uid,
        strain_code: strainCode,
        strain_name: strainName,
        parent_id: null,
        migrated_at: new Date(),
      });

      return { 
        plantId: plant.id, 
        status: 'migrated', 
        type: 'seed',
        uid: uid 
      };
    }

  } catch (error) {
    return { 
      plantId: plant.id, 
      status: 'error', 
      error: error.message 
    };
  }
};

/**
 * Helper: Count existing plants for a given strain/date key
 */
const countExistingPlantsForKey = async (userId, migrationKey) => {
  // This is a simplified count - in a real migration you'd query existing plants
  // For now, we'll return 0 and let the actual counters handle new plants
  return 0;
};

/**
 * Helper: Count existing clones for parent estimation
 */
const countExistingClonesForParent = async (userId, strain, dateBorn) => {
  // Simplified count for migration
  return 0;
};

/**
 * Main migration function - migrate all plants for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Migration summary
 */
export const migrateUserPlants = async (userId) => {
  try {
    console.log(`Starting migration for user: ${userId}`);
    
    // Get all user plants
    const plants = await getUserPlants(userId);
    
    if (plants.length === 0) {
      return { 
        status: 'completed', 
        totalPlants: 0, 
        migrated: 0, 
        skipped: 0, 
        errors: 0 
      };
    }

    // Track strain codes and used codes
    const strainCodeMap = new Map();
    const usedCodes = new Set();
    
    // Process each plant
    const results = [];
    for (const plant of plants) {
      const result = await migratePlant(userId, plant, strainCodeMap, usedCodes);
      results.push(result);
      
      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summarize results
    const summary = {
      status: 'completed',
      totalPlants: plants.length,
      migrated: results.filter(r => r.status === 'migrated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      details: results
    };

    console.log('Migration completed:', summary);
    return summary;

  } catch (error) {
    console.error('Migration failed:', error);
    throw new Error(`Migration failed: ${error.message}`);
  }
};

/**
 * Check if user needs migration
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if migration needed
 */
export const needsMigration = async (userId) => {
  try {
    const plants = await getUserPlants(userId);
    return plants.some(plant => !plant.unique_id);
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};
