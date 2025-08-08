// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getUserPlants, getPlantStats } from '../utils/firestore';
import { logInfo, logError } from '../utils/logger';

const useDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State management
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    clones: 0, 
    harvested: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Load dashboard data with error handling and retry logic
  const loadDashboardData = useCallback(async (isRetry = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError('');

      logInfo('Loading dashboard data for user', { userId: user.id });

      const [userPlants, plantStats] = await Promise.all([
        getUserPlants(user.id),
        getPlantStats(user.id)
      ]);
      
      setPlants(userPlants || []);
      
      // Ensure userPlants is an array before filtering
      const plantsArray = Array.isArray(userPlants) ? userPlants : [];
      
      setStats({
        total: plantStats?.total || plantsArray.length || 0,
        active: plantStats?.active || plantsArray.filter(p => p.status !== 'harvested' && !p.harvested).length || 0,
        clones: plantStats?.clones || plantsArray.filter(p => p.isClone || p.origin === 'clone').length || 0,
        harvested: plantStats?.harvested || plantsArray.filter(p => p.status === 'harvested' || p.harvested).length || 0
      });

      setRetryCount(0); // Reset retry count on success
      logInfo('Dashboard data loaded successfully', { 
        plantsCount: userPlants?.length || 0,
        stats: plantStats 
      });

    } catch (error) {
      logError(error, { retryCount });
      setError('Failed to load dashboard data. Please try again.');
      
      // Auto-retry logic for network errors
      if (retryCount < 2 && (error.code === 'unavailable' || error.message.includes('network'))) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadDashboardData(true);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, retryCount]);

  // Navigation handlers
  const handleNavigateToPlants = useCallback(() => {
    navigate('/plants');
  }, [navigate]);

  const handleNavigateToAddPlant = useCallback(() => {
    navigate('/plant');
  }, [navigate]);

  const handleNavigateToPlantDetail = useCallback((plantId) => {
    navigate(`/plants/${plantId}`);
  }, [navigate]);

  // Authentication handlers
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logError(error, { operation: 'logout' });
      setError('Failed to logout. Please try again.');
    }
  }, [logout, navigate]);

  // Retry handler for failed requests
  const retryLoadData = useCallback(() => {
    setRetryCount(0);
    loadDashboardData();
  }, [loadDashboardData]);

  // Clear error handler
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Recent plants (last 5 active plants)
  const recentPlants = Array.isArray(plants) ? plants
    .filter(plant => plant.status !== 'harvested' && !plant.harvested)
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, 5) : [];

  // Load data on mount and user change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Performance optimization: Return memoized values
  return {
    // State
    plants,
    stats,
    loading,
    error,
    recentPlants,
    
    // User info
    user,
    
    // Actions
    loadDashboardData,
    retryLoadData,
    clearError,
    
    // Navigation
    handleNavigateToPlants,
    handleNavigateToAddPlant,
    handleNavigateToPlantDetail,
    handleLogout,
    
    // Computed values
    hasPlants: plants.length > 0,
    isFirstTime: plants.length === 0 && !loading && !error,
  };
};

export default useDashboard;
