// localStorage utility functions for Pheno Hunter

// Auth-related storage
export const AUTH_STORAGE_KEY = 'phenoHunter_auth';
export const PLANTS_STORAGE_KEY = 'phenoHunter_plants';

// Mock user credentials for demo
export const DEMO_CREDENTIALS = {
  username: 'demo',
  password: 'hunter123'
};

// Auth utilities
export const saveAuthSession = (user) => {
  const authData = {
    user,
    timestamp: new Date().toISOString(),
    isAuthenticated: true
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const getAuthSession = () => {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    return authData ? JSON.parse(authData) : null;
  } catch (error) {
    console.error('Error parsing auth session:', error);
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = () => {
  const session = getAuthSession();
  return session && session.isAuthenticated;
};

// Plant data utilities
export const savePlantsData = (plants) => {
  localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants));
};

export const getPlantsData = () => {
  try {
    const plantsData = localStorage.getItem(PLANTS_STORAGE_KEY);
    return plantsData ? JSON.parse(plantsData) : [];
  } catch (error) {
    console.error('Error parsing plants data:', error);
    return [];
  }
};

export const generatePlantId = () => {
  return 'plant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Image utilities
export const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
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
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const convertImageToBase64 = async (file) => {
  try {
    // First compress the image if it's too large
    let processedFile = file;
    
    // If file is larger than 500KB, compress it
    if (file.size > 500 * 1024) {
      processedFile = await compressImage(file);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Check if base64 string is still too large (close to 1MB limit)
        if (result.length > 900000) { // Leave some buffer
          // Try more aggressive compression
          compressImage(file, 600, 450, 0.6).then(compressedFile => {
            const reader2 = new FileReader();
            reader2.onload = () => resolve(reader2.result);
            reader2.onerror = reject;
            reader2.readAsDataURL(compressedFile);
          }).catch(reject);
        } else {
          resolve(result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(processedFile);
    });
  } catch (error) {
    throw new Error('Failed to process image: ' + error.message);
  }
};
