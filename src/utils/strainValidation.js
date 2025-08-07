// Strain Registry & Validation Utilities
import { getStrainCode, addStrainToRegistry } from './uidBackend';

// Reserved strain codes (profanity, ambiguous codes, etc.)
const RESERVED_CODES = [
  'XXX', 'BAD', 'ASS', 'SEX', 'GAY', 'FAG', 'WTF', 'FUK', 'DIE', 'KKK',
  'HIV', 'AIDS', 'SOS', 'FBI', 'CIA', 'DEA', 'ATF', 'ICE', 'TSA',
  'GOD', 'JEW', 'ISIS', 'Nazi', 'KGB', 'IRA', 'PLO'
];

/**
 * Validate strain code format and content
 * @param {string} code - 3-letter strain code
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateStrainCode = (code) => {
  // Check format: exactly 3 uppercase letters
  const regex = /^[A-Z]{3}$/;
  if (!regex.test(code)) {
    return { 
      valid: false, 
      error: 'Strain code must be exactly 3 uppercase letters (A-Z)' 
    };
  }

  // Check reserved words
  if (RESERVED_CODES.includes(code.toUpperCase())) {
    return { 
      valid: false, 
      error: 'This code is reserved. Please choose a different 3-letter code.' 
    };
  }

  return { valid: true };
};

/**
 * Normalize strain code (force uppercase)
 * @param {string} code - Input strain code
 * @returns {string} - Normalized uppercase code
 */
export const normalizeStrainCode = (code) => {
  return code ? code.toUpperCase().trim() : '';
};

/**
 * Get or create strain code for a strain
 * @param {string} userId - User ID
 * @param {string} strainName - Strain name
 * @param {string} proposedCode - User-proposed code (optional)
 * @returns {Promise<object>} { code: string, isNew: boolean, warning?: string }
 */
export const getOrCreateStrainCode = async (userId, strainName, proposedCode = null) => {
  try {
    // Check if strain already exists in registry
    const existingCode = await getStrainCode(userId, strainName);
    
    if (existingCode) {
      // Strain exists - use existing code
      if (proposedCode && proposedCode !== existingCode) {
        return {
          code: existingCode,
          isNew: false,
          warning: `This strain already uses code "${existingCode}". We've applied the existing code to keep IDs consistent.`
        };
      }
      return { code: existingCode, isNew: false };
    }

    // New strain - validate and use proposed code
    if (!proposedCode) {
      throw new Error('Strain code is required for new strains');
    }

    const normalizedCode = normalizeStrainCode(proposedCode);
    const validation = validateStrainCode(normalizedCode);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if code is already used by another strain
    const isCodeTaken = await isStrainCodeTaken(userId, normalizedCode);
    if (isCodeTaken) {
      throw new Error(`Code "${normalizedCode}" is already used by another strain. Please choose a different code.`);
    }

    // Add to registry
    await addStrainToRegistry(userId, strainName, normalizedCode);
    
    return { code: normalizedCode, isNew: true };
    
  } catch (error) {
    throw new Error(`Strain code error: ${error.message}`);
  }
};

/**
 * Check if a strain code is already taken by another strain
 * @param {string} userId - User ID
 * @param {string} code - Strain code to check
 * @returns {Promise<boolean>} - True if code is taken
 */
export const isStrainCodeTaken = async (userId, code) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const registryRef = collection(db, 'strain_registry_' + userId);
    const q = query(registryRef, where('strain_code', '==', code));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking strain code:', error);
    return false; // Assume not taken if error
  }
};

/**
 * Get all strain codes for a user (for UI autocomplete, etc.)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of { strainName, strainCode }
 */
export const getAllUserStrainCodes = async (userId) => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const registryRef = collection(db, 'strain_registry_' + userId);
    const querySnapshot = await getDocs(registryRef);
    
    return querySnapshot.docs.map(doc => ({
      strainName: doc.data().strain_name,
      strainCode: doc.data().strain_code
    }));
  } catch (error) {
    console.error('Error fetching strain codes:', error);
    return [];
  }
};
