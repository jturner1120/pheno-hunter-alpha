// UID Generation Logic for Pheno Hunter
import { getNextSeedSeq, getNextCloneSeq } from './uidBackend';
import { getOrCreateStrainCode } from './strainValidation';

/**
 * Format date as DDMMYY for UID
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForUID = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
};

/**
 * Generate UID for a seed plant
 * @param {string} userId - User ID
 * @param {string} strainName - Strain name
 * @param {string} proposedStrainCode - User-proposed strain code (optional)
 * @param {Date} dateBorn - Date plant was created
 * @returns {Promise<object>} - { uid, strainCode, isNewStrain, warning? }
 */
export const generateSeedUID = async (userId, strainName, proposedStrainCode = null, dateBorn = new Date()) => {
  try {
    // Get or create strain code
    const strainResult = await getOrCreateStrainCode(userId, strainName, proposedStrainCode);
    const { code: strainCode, isNew: isNewStrain, warning } = strainResult;
    
    // Format date
    const dateBornStr = formatDateForUID(dateBorn);
    
    // Get next seed sequence for this strain/date
    const seedSeq = await getNextSeedSeq(userId, strainCode, dateBornStr);
    const seedSeqStr = String(seedSeq).padStart(2, '0');
    
    // Generate UID: [STRAIN_CODE]_[DATE_BORN:DDMMYY]_[SEED_SEQ]
    const uid = `${strainCode}_${dateBornStr}_${seedSeqStr}`;
    
    return {
      uid,
      strainCode,
      isNewStrain,
      warning
    };
    
  } catch (error) {
    throw new Error(`Failed to generate seed UID: ${error.message}`);
  }
};

/**
 * Generate UID for a clone plant
 * @param {string} userId - User ID
 * @param {string} parentUID - Parent plant's UID
 * @param {string} parentPlantId - Parent plant's document ID
 * @returns {Promise<object>} - { uid, cloneSeq }
 */
export const generateCloneUID = async (userId, parentUID, parentPlantId) => {
  try {
    if (!parentUID) {
      throw new Error('Parent UID is required for clone generation');
    }
    
    if (!parentPlantId) {
      throw new Error('Parent plant ID is required for clone generation');
    }
    
    // Get next clone sequence for this parent
    const cloneSeq = await getNextCloneSeq(userId, parentPlantId);
    const cloneSeqStr = String(cloneSeq).padStart(2, '0');
    
    // Generate UID: [PARENT_UID]_c[CLONE_SEQ]
    const uid = `${parentUID}_c${cloneSeqStr}`;
    
    return {
      uid,
      cloneSeq
    };
    
  } catch (error) {
    throw new Error(`Failed to generate clone UID: ${error.message}`);
  }
};

/**
 * Validate UID format
 * @param {string} uid - UID to validate
 * @returns {object} - { valid: boolean, type: 'seed'|'clone'|'unknown', error?: string }
 */
export const validateUID = (uid) => {
  if (!uid || typeof uid !== 'string') {
    return { valid: false, type: 'unknown', error: 'UID is required' };
  }
  
  // Seed UID pattern: XXX_DDMMYY_NN
  const seedPattern = /^[A-Z]{3}_\d{6}_\d{2}$/;
  
  // Clone UID pattern: XXX_DDMMYY_NN_cNN or XXX_DDMMYY_NN_cNN_cNN (multiple clone levels)
  const clonePattern = /^[A-Z]{3}_\d{6}_\d{2}(_c\d{2})+$/;
  
  if (seedPattern.test(uid)) {
    return { valid: true, type: 'seed' };
  }
  
  if (clonePattern.test(uid)) {
    return { valid: true, type: 'clone' };
  }
  
  return { 
    valid: false, 
    type: 'unknown', 
    error: 'UID format is invalid. Expected format: XXX_DDMMYY_NN or XXX_DDMMYY_NN_cNN' 
  };
};

/**
 * Parse UID to extract components
 * @param {string} uid - UID to parse
 * @returns {object} - { strainCode, dateBorn, seedSeq, cloneSeqs?, type }
 */
export const parseUID = (uid) => {
  const validation = validateUID(uid);
  if (!validation.valid) {
    throw new Error(`Invalid UID: ${validation.error}`);
  }
  
  const parts = uid.split('_');
  
  return {
    strainCode: parts[0],
    dateBorn: parts[1],
    seedSeq: parts[2],
    cloneSeqs: parts.slice(3), // Array of clone sequences (e.g., ['c01', 'c02'])
    type: validation.type
  };
};

/**
 * Check if UID is unique for user (final validation)
 * @param {string} userId - User ID
 * @param {string} uid - UID to check
 * @returns {Promise<boolean>} - True if unique
 */
export const isUIDUnique = async (userId, uid) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const plantsRef = collection(db, 'users', userId, 'plants');
    const q = query(plantsRef, where('unique_id', '==', uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty;
    
  } catch (error) {
    console.error('Error checking UID uniqueness:', error);
    return false; // Assume not unique if error (safer)
  }
};
