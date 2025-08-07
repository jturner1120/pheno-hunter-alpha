// Firebase Storage utilities for image uploads
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { logInfo, logError } from './logger';

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for organizing files
 * @param {string} plantId - Plant ID for organizing files
 * @param {string} type - Type of image ('main', 'clone', etc.)
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadPlantImage = async (file, userId, plantId, type = 'main') => {
  try {
    logInfo('Starting image upload', { 
      fileName: file.name, 
      fileSize: file.size, 
      userId, 
      plantId, 
      type 
    });

    // Create a reference to the file location
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${type}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `plants/${userId}/${plantId}/${fileName}`);

    // Compress image if it's too large (for better performance)
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
      fileToUpload = await compressImageForStorage(file);
    }

    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    logInfo('Image upload successful', { 
      downloadURL, 
      originalSize: file.size,
      uploadedSize: fileToUpload.size,
      compressionRatio: Math.round((1 - fileToUpload.size / file.size) * 100)
    });

    return downloadURL;
  } catch (error) {
    logError('Image upload failed', error, { userId, plantId, type });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Full download URL of image to delete
 * @returns {Promise<void>}
 */
export const deletePlantImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('firebase')) {
      return; // Not a Firebase Storage URL, skip
    }

    // Extract the storage path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    if (!pathMatch) return;
    
    const storagePath = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage, storagePath);
    
    await deleteObject(imageRef);
    logInfo('Image deleted successfully', { imageUrl });
  } catch (error) {
    logError('Image deletion failed', error, { imageUrl });
    // Don't throw error for deletion failures - not critical
  }
};

/**
 * Compress image for storage (better than base64 compression)
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>} - Compressed image file
 */
const compressImageForStorage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob (File-like object)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File object with the original name
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if URL is a Firebase Storage URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Firebase Storage URL
 */
export const isFirebaseStorageUrl = (url) => {
  return url && (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('storage.googleapis.com')
  );
};

/**
 * Check if URL is a base64 data URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a base64 data URL
 */
export const isBase64Url = (url) => {
  return url && url.startsWith('data:image/');
};

/**
 * Get image type from URL
 * @param {string} url - Image URL
 * @returns {string} - 'firebase', 'base64', or 'unknown'
 */
export const getImageType = (url) => {
  if (isFirebaseStorageUrl(url)) return 'firebase';
  if (isBase64Url(url)) return 'base64';
  return 'unknown';
};
