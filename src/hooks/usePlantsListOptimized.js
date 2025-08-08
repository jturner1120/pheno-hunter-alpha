// src/hooks/usePlantsListOptimized.js
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getUserPlants, getPlantStats } from '../utils/firestore';
import { logInfo, logError, logPerformance, measurePerformance } from '../utils/logger';

// Performance constants
const INITIAL_LOAD_SIZE = 20;
const LOAD_MORE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const VIRTUALIZATION_THRESHOLD = 50;

export const usePlantsListOptimized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Core state
  const [allPlants, setAllPlants] = useState([]);
  const [displayedPlants, setDisplayedPlants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // Filter and search state
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'active');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Performance optimization refs
  const searchTimeoutRef = useRef(null);
  const lastFilterRef = useRef(activeFilter);
  const lastSearchRef = useRef(searchQuery);
  
  // Memoized filter functions for performance
  const filterFunctions = useMemo(() => ({
    all: () => true,
    active: (plant) => plant.status !== 'harvested' && !plant.harvested,
    harvested: (plant) => plant.status === 'harvested' || plant.harvested,
    clones: (plant) => plant.isClone || plant.origin === 'Clone' || plant.origin === 'clone',
    seedling: (plant) => plant.status === 'seedling',
    vegetative: (plant) => plant.status === 'vegetative',
    flowering: (plant) => plant.status === 'flowering',
  }), []);

  // Memoized sort functions
  const sortFunctions = useMemo(() => ({
    createdAt: (a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    },
    name: (a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'desc' ? -comparison : comparison;
    },
    strain: (a, b) => {
      const comparison = a.strain.localeCompare(b.strain);
      return sortOrder === 'desc' ? -comparison : comparison;
    },
    status: (a, b) => {
      const comparison = (a.status || 'active').localeCompare(b.status || 'active');
      return sortOrder === 'desc' ? -comparison : comparison;
    },
  }), [sortOrder]);

  // Search function with performance optimization
  const searchFunction = useCallback((plant, query) => {
    if (!query) return true;
    
    const searchLower = query.toLowerCase();
    return (
      plant.name?.toLowerCase().includes(searchLower) ||
      plant.strain?.toLowerCase().includes(searchLower) ||
      plant.uid?.toLowerCase().includes(searchLower) ||
      plant.notes?.toLowerCase().includes(searchLower)
    );
  }, []);

  // Optimized filtered and sorted plants calculation
  const processedPlants = useMemo(() => {
    const startTime = performance.now();
    
    let filtered = allPlants;
    
    // Apply filter
    const filterFn = filterFunctions[activeFilter] || filterFunctions.all;
    filtered = filtered.filter(filterFn);
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(plant => searchFunction(plant, searchQuery));
    }
    
    // Apply sort
    const sortFn = sortFunctions[sortBy] || sortFunctions.createdAt;
    filtered = [...filtered].sort(sortFn);
    
    const duration = performance.now() - startTime;
    if (duration > 10) { // Only log if processing takes > 10ms
      logPerformance('plants_list_processing', duration, {
        totalPlants: allPlants.length,
        filteredPlants: filtered.length,
        filter: activeFilter,
        search: searchQuery ? 'yes' : 'no',
        sort: sortBy,
      });
    }
    
    return filtered;
  }, [allPlants, activeFilter, searchQuery, sortBy, searchFunction, filterFunctions, sortFunctions]);

  // Load initial plants data
  const loadPlants = useCallback(async (isRetry = false) => {
    if (!user?.id) return;
    
    try {
      if (!isRetry) setLoading(true);
      setError('');
      
      const result = await measurePerformance('load_plants_data', async () => {
        const [plantsData, statsData] = await Promise.all([
          getUserPlants(user.id),
          getPlantStats(user.id)
        ]);
        return { plantsData, statsData };
      });
      
      setAllPlants(result.plantsData || []);
      setStats(result.statsData || {});
      setTotalCount(result.plantsData?.length || 0);
      
      // Reset pagination when loading new data
      setCurrentPage(0);
      setDisplayedPlants([]);
      
      logInfo('Plants data loaded successfully', {
        userId: user.id,
        plantCount: result.plantsData?.length || 0,
        stats: result.statsData,
      });
      
    } catch (error) {
      logError(error, { operation: 'loadPlants', userId: user.id });
      setError('Failed to load plants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Pagination - load more plants
  const loadMorePlants = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    const startIndex = currentPage * LOAD_MORE_SIZE;
    const endIndex = Math.min(startIndex + LOAD_MORE_SIZE, processedPlants.length);
    const newPlants = processedPlants.slice(startIndex, endIndex);
    
    setDisplayedPlants(prev => [...prev, ...newPlants]);
    setCurrentPage(prev => prev + 1);
    setHasMore(endIndex < processedPlants.length);
    
    setTimeout(() => setLoadingMore(false), 100); // Small delay for UX
  }, [loadingMore, hasMore, currentPage, processedPlants]);

  // Update displayed plants when processed plants change
  useEffect(() => {
    const shouldReset = 
      lastFilterRef.current !== activeFilter || 
      lastSearchRef.current !== searchQuery;
    
    if (shouldReset) {
      // Reset pagination when filter/search changes
      setCurrentPage(0);
      const initialPlants = processedPlants.slice(0, INITIAL_LOAD_SIZE);
      setDisplayedPlants(initialPlants);
      setHasMore(processedPlants.length > INITIAL_LOAD_SIZE);
      
      lastFilterRef.current = activeFilter;
      lastSearchRef.current = searchQuery;
    } else if (currentPage === 0 && displayedPlants.length === 0) {
      // Initial load
      const initialPlants = processedPlants.slice(0, INITIAL_LOAD_SIZE);
      setDisplayedPlants(initialPlants);
      setHasMore(processedPlants.length > INITIAL_LOAD_SIZE);
    }
  }, [processedPlants, activeFilter, searchQuery, currentPage, displayedPlants.length]);

  // Debounced search handler
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (query) {
        newParams.set('search', query);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }, SEARCH_DEBOUNCE_MS);
  }, [searchParams, setSearchParams]);

  // Filter change handler
  const handleFilterChange = useCallback((filterType) => {
    setActiveFilter(filterType);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filterType);
    setSearchParams(newParams);
    
    logInfo('Plants filter changed', { filter: filterType, userId: user?.id });
  }, [searchParams, setSearchParams, user?.id]);

  // Sort change handler
  const handleSortChange = useCallback((newSortBy, newSortOrder = sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSortBy);
    newParams.set('order', newSortOrder);
    setSearchParams(newParams);
    
    logInfo('Plants sort changed', { 
      sortBy: newSortBy, 
      sortOrder: newSortOrder, 
      userId: user?.id 
    });
  }, [sortOrder, searchParams, setSearchParams, user?.id]);

  // Navigation handlers
  const handleView = useCallback((plantId) => {
    navigate(`/plants/${plantId}`);
  }, [navigate]);

  const handleClone = useCallback((plant) => {
    navigate(`/plants/${plant.id}?action=clone`);
  }, [navigate]);

  const handleHarvest = useCallback((plant) => {
    navigate(`/plants/${plant.id}?action=harvest`);
  }, [navigate]);

  const handleAddPlant = useCallback(() => {
    navigate('/plant');
  }, [navigate]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Utility functions
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusBadge = useCallback((plant) => {
    const status = plant.status || 'active';
    const statusConfig = {
      seedling: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🌱 Seedling' },
      vegetative: { bg: 'bg-green-100', text: 'text-green-800', label: '🌿 Vegetative' },
      flowering: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🌸 Flowering' },
      harvested: { bg: 'bg-gray-100', text: 'text-gray-800', label: '🌾 Harvested' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: '🌱 Active' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`,
      label: config.label
    };
  }, []);

  // Load plants on mount and user change
  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Performance metrics
  const shouldUseVirtualization = processedPlants.length > VIRTUALIZATION_THRESHOLD;

  return {
    // State
    plants: allPlants,
    displayedPlants,
    stats,
    loading,
    loadingMore,
    error,
    activeFilter,
    searchQuery,
    sortBy,
    sortOrder,
    
    // Computed
    filteredPlantsCount: processedPlants.length,
    totalCount,
    hasMore,
    shouldUseVirtualization,
    currentPage,
    
    // Actions
    loadPlants,
    loadMorePlants,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleView,
    handleClone,
    handleHarvest,
    handleAddPlant,
    handleBackToDashboard,
    
    // Utilities
    formatDate,
    getStatusBadge,
    
    // Performance data
    performanceMetrics: {
      totalPlants: allPlants.length,
      displayedPlants: displayedPlants.length,
      filteredPlants: processedPlants.length,
      virtualizationEnabled: shouldUseVirtualization,
    }
  };
};
