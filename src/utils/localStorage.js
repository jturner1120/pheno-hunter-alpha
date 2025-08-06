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
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
