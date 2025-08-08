import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getUserPlants, getPlantStats } from '../utils/firestore';

export const usePlantsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');

  const loadPlants = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [plantsData, statsData] = await Promise.all([
        getUserPlants(user.id),
        getPlantStats(user.id)
      ]);
      
      setPlants(plantsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading plants:', error);
      setError('Failed to load plants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPlants();
    }
  }, [user, loadPlants]);

  const formatDate = useCallback((dateField) => {
    if (!dateField) return 'N/A';
    
    // Handle Firestore timestamp
    let date;
    if (dateField.toDate) {
      date = dateField.toDate();
    } else if (typeof dateField === 'string') {
      date = new Date(dateField);
    } else {
      date = dateField;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusBadge = useCallback((plant) => {
    const status = plant.status || (plant.harvested ? 'harvested' : 'active');
    
    const statusConfig = {
      seedling: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Seedling' },
      vegetative: { bg: 'bg-green-100', text: 'text-green-800', label: 'Vegetative' },
      flowering: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Flowering' },
      harvested: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Harvested' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`,
      label: config.label
    };
  }, []);

  const getFilteredPlants = useCallback(() => {
    switch (activeFilter) {
      case 'all':
        return plants.filter(p => p.status !== 'harvested' && !p.harvested);
      case 'active':
        return plants.filter(p => p.status !== 'harvested' && !p.harvested);
      case 'harvested':
        return plants.filter(p => p.status === 'harvested' || p.harvested);
      case 'clones':
        return plants.filter(p => p.isClone || p.origin === 'Clone');
      default:
        return plants.filter(p => p.status !== 'harvested' && !p.harvested);
    }
  }, [plants, activeFilter]);

  const handleView = useCallback((plantId) => {
    navigate(`/plants/${plantId}`);
  }, [navigate]);

  const handleClone = useCallback((plant) => {
    navigate(`/plants/${plant.id}`);
  }, [navigate]);

  const handleHarvest = useCallback((plant) => {
    navigate(`/plants/${plant.id}`);
  }, [navigate]);

  const handleAddPlant = useCallback(() => {
    navigate('/plant');
  }, [navigate]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleFilterChange = useCallback((filterType) => {
    setActiveFilter(filterType);
  }, []);

  return {
    // State
    plants,
    stats,
    loading,
    error,
    activeFilter,
    
    // Computed
    filteredPlants: getFilteredPlants(),
    
    // Actions
    loadPlants,
    handleView,
    handleClone,
    handleHarvest,
    handleAddPlant,
    handleBackToDashboard,
    handleFilterChange,
    
    // Utilities
    formatDate,
    getStatusBadge
  };
};
