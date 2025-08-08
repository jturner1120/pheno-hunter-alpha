import { useState, useEffect, useCallback, useRef } from 'react';
import { getPlantById, updatePlant } from '../utils/firestore';
import { uploadPlantImageSmart, deletePlantImageSmart } from '../utils/imageUtils';
import { logError, logInfo } from '../utils/logger';

/**
 * Custom hook for managing plant detail state and operations
 * @param {string} plantId - Plant ID to load
 * @param {string} userId - User ID
 * @returns {Object} Plant state and operations
 */
export const usePlantDetail = (plantId, userId) => {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDiary, setEditingDiary] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [copyToast, setCopyToast] = useState('');

  // Cleanup timeouts to prevent memory leaks
  const timeoutRef = useRef(null);

  // Load plant data
  const loadPlant = useCallback(async () => {
    if (!userId) {
      setError('Please log in to view plant details');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const foundPlant = await getPlantById(userId, plantId);
      
      if (!foundPlant) {
        setError('Plant not found');
        setLoading(false);
        return;
      }
      
      setPlant(foundPlant);
      setDiaryText(foundPlant.diary || '');
      logInfo('Plant loaded successfully', { plantId, strain: foundPlant.strain });
    } catch (err) {
      logError(err, { operation: 'loadPlant', plantId, userId });
      setError('Failed to load plant details');
    } finally {
      setLoading(false);
    }
  }, [plantId, userId]);

  // Update plant data
  const updatePlantData = useCallback(async (updatedPlantData) => {
    try {
      await updatePlant(userId, plantId, updatedPlantData);
      setPlant(prev => ({ ...prev, ...updatedPlantData }));
      logInfo('Plant updated successfully', { plantId, updateFields: Object.keys(updatedPlantData) });
    } catch (err) {
      logError(err, { operation: 'updatePlantData', plantId, userId });
      setError('Failed to save changes');
    }
  }, [userId, plantId]);

  // Copy UID to clipboard
  const copyUidToClipboard = useCallback(async () => {
    if (!plant?.uid) return;
    
    try {
      await navigator.clipboard.writeText(plant.uid);
      setCopyToast('UID copied!');
      
      // Clear timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setCopyToast('');
        timeoutRef.current = null;
      }, 2000);
      
      logInfo('UID copied to clipboard', { plantId: plant.id, uid: plant.uid });
    } catch (err) {
      logError(err, { operation: 'copyUidToClipboard', plantId });
      setCopyToast('Failed to copy');
      
      timeoutRef.current = setTimeout(() => {
        setCopyToast('');
        timeoutRef.current = null;
      }, 2000);
    }
  }, [plant]);

  // Diary operations
  const handleDiarySave = useCallback(() => {
    updatePlantData({ diary: diaryText });
    setEditingDiary(false);
  }, [diaryText, updatePlantData]);

  const handleDiaryCancel = useCallback(() => {
    setDiaryText(plant?.diary || '');
    setEditingDiary(false);
  }, [plant?.diary]);

  const startDiaryEdit = useCallback(() => {
    setEditingDiary(true);
  }, []);

  const setDiaryTextValue = useCallback((text) => {
    setDiaryText(text);
  }, []);

  // Image upload
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    setError('Uploading image...');
    
    try {
      // Delete old image if it exists and is from Firebase Storage
      if (plant?.imageUrl) {
        await deletePlantImageSmart(plant.imageUrl);
      }

      // Upload new image
      const imageUrl = await uploadPlantImageSmart(file, userId, plant.id, 'main');
      
      // Update plant with new image URL
      await updatePlantData({ imageUrl });
      setError('');
      
      logInfo('Plant image uploaded successfully', { plantId, imageSize: file.size });
    } catch (err) {
      logError(err, { operation: 'handleImageUpload', plantId, fileSize: file.size });
      setError('Failed to upload image. Please try a smaller image or different format.');
    }
  }, [plant, userId, plantId, updatePlantData]);

  // Plant update handlers
  const handlePlantUpdate = useCallback((updatedPlant) => {
    setPlant(updatedPlant);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Load plant on mount and when IDs change
  useEffect(() => {
    loadPlant();
  }, [loadPlant]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    plant,
    loading,
    error,
    editingDiary,
    diaryText,
    copyToast,
    
    // Actions
    updatePlantData,
    copyUidToClipboard,
    handleDiarySave,
    handleDiaryCancel,
    startDiaryEdit,
    setDiaryTextValue,
    handleImageUpload,
    handlePlantUpdate,
    clearError,
    reloadPlant: loadPlant
  };
};
