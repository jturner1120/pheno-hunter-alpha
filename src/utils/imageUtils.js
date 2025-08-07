// Smart image utility - handles both Firebase Storage and base64
import { uploadPlantImage, deletePlantImage, isBase64Url, isFirebaseStorageUrl } from './firebaseStorage';
import { convertImageToBase64 } from './localStorage';

/**
 * Smart image upload - chooses best storage method
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID (optional for new plants)
 * @param {string} type - Image type ('main', 'clone', etc.)
 * @returns {Promise<string>} - Image URL or base64 string
 */
export const uploadPlantImageSmart = async (file, userId, plantId = null, type = 'main') => {
  try {
    // For new plants without ID, use base64 temporarily
    if (!plantId) {
      // Use compressed base64 for new plants
      return await convertImageToBase64(file);
    }

    // For existing plants, prefer Firebase Storage
    try {
      // Try Firebase Storage first
      const firebaseUrl = await uploadPlantImage(file, userId, plantId, type);
      return firebaseUrl;
    } catch (firebaseError) {
      console.warn('Firebase Storage failed, falling back to base64:', firebaseError);
      // Fallback to base64 if Firebase fails
      return await convertImageToBase64(file);
    }
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Smart image deletion - handles both storage types
 * @param {string} imageUrl - Image URL or base64 to delete
 * @returns {Promise<void>}
 */
export const deletePlantImageSmart = async (imageUrl) => {
  if (isFirebaseStorageUrl(imageUrl)) {
    await deletePlantImage(imageUrl);
  }
  // Base64 images don't need deletion (they're just strings)
};

/**
 * Convert base64 image to Firebase Storage (for migration)
 * @param {string} base64Image - Base64 image string
 * @param {string} userId - User ID
 * @param {string} plantId - Plant ID
 * @param {string} type - Image type
 * @returns {Promise<string>} - Firebase Storage URL
 */
export const migrateBase64ToStorage = async (base64Image, userId, plantId, type = 'main') => {
  try {
    if (!isBase64Url(base64Image)) {
      return base64Image; // Already migrated or not base64
    }

    // Convert base64 to File object
    const response = await fetch(base64Image);
    const blob = await response.blob();
    const file = new File([blob], `migrated_${type}.jpg`, { type: 'image/jpeg' });

    // Upload to Firebase Storage
    const firebaseUrl = await uploadPlantImage(file, userId, plantId, type);
    
    return firebaseUrl;
  } catch (error) {
    console.warn('Migration failed for image, keeping base64:', error);
    return base64Image; // Keep original if migration fails
  }
};

/**
 * Get optimized image URL with Firebase transformations
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!isFirebaseStorageUrl(imageUrl)) {
    return imageUrl; // Return as-is for non-Firebase URLs
  }

  const { 
    width = null, 
    height = null, 
    quality = 85,
    format = 'webp' 
  } = options;

  // Firebase Storage doesn't have built-in transformations like Cloudinary
  // But we can add query parameters for future CDN integration
  let optimizedUrl = imageUrl;
  
  // For now, return original URL
  // In the future, you could integrate with Cloudinary or similar service
  
  return optimizedUrl;
};

/**
 * Preload image for better UX
 * @param {string} imageUrl - Image URL to preload
 * @returns {Promise<void>}
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });
};
