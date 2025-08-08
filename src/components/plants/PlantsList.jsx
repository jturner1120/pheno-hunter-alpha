import React, { useState, useCallback, useMemo } from 'react';
import { usePlantsListOptimized } from '../../hooks/usePlantsListOptimized';
import PlantsSearchAndFilters from './PlantsSearchAndFilters';
import PlantsStatsFilters from './PlantsStatsFilters';
import PlantsVirtualizedList from './PlantsVirtualizedList';
import PlantsTable from './PlantsCards';
import PlantsMobileCards from './PlantsMobileCards';
import PlantsEmptyState from './PlantsEmptyState';
import { PlantsLoadingState, PlantsErrorState } from './PlantsStates';
import MultiSelectProvider from './bulk/MultiSelectProvider';
import BulkActionBar from './bulk/BulkActionBar';
import BulkEditModal from './bulk/BulkEditModal';
import ProgressTracker from './bulk/ProgressTracker';

const PlantsList = () => {
  // Local state for view preferences
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'table', 'cards', 'virtualized'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const {
    // State
    plants,
    displayedPlants,
    totalCount,
    stats,
    loading,
    loadingMore,
    error,
    
    // Search & Filters
    searchQuery,
    activeFilter,
    sortBy,
    sortOrder,
    
    // Computed
    filteredPlantsCount,
    hasMore,
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
    getStatusBadge
  } = usePlantsListOptimized();

  // Use displayedPlants as filteredPlants for component compatibility
  const filteredPlants = displayedPlants;
  const searchTerm = searchQuery;

  // Determine optimal view mode
  const optimalViewMode = useMemo(() => {
    if (viewMode !== 'auto') return viewMode;
    
    // Auto-select based on data size and screen
    const isLargeDataset = totalCount > 100;
    const isMobile = window.innerWidth < 768;
    
    if (isLargeDataset) return 'virtualized';
    if (isMobile) return 'cards';
    return 'table';
  }, [viewMode, totalCount]);

  // Memoized handlers
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleToggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  if (loading && !plants.length) {
    return <PlantsLoadingState />;
  }

  if (error && !plants.length) {
    return <PlantsErrorState error={error} onRetry={loadPlants} />;
  }

  return (
    <MultiSelectProvider plants={plants}>
      <div className="min-h-screen bg-patriot-gray">
        <BulkActionBar />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToDashboard}
                  className="text-patriot-blue hover:text-blue-700 mr-4"
                  aria-label="Back to Dashboard"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-xl font-bold text-patriot-navy">Your Plants</h1>
                {totalCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({totalCount} total)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                {totalCount > 20 && (
                  <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => handleViewModeChange('table')}
                      className={`px-3 py-1 text-xs rounded ${optimalViewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                      title="Table View"
                    >
                      Table
                    </button>
                    <button
                      onClick={() => handleViewModeChange('virtualized')}
                      className={`px-3 py-1 text-xs rounded ${optimalViewMode === 'virtualized' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                      title="List View (Virtualized)"
                    >
                      List
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={handleAddPlant}
                  className="btn-primary"
                >
                  + Add Plant
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {plants.length === 0 && !loading ? (
          <PlantsEmptyState 
            activeFilter="all"
            onAddPlant={handleAddPlant}
          />
        ) : (
          <div className="space-y-6">
            {/* Search and Filters */}
            <PlantsSearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              filteredCount={filteredPlantsCount}
              totalCount={totalCount}
              loading={loading}
            />

            {/* Summary Stats - Clickable Filters */}
            <PlantsStatsFilters 
              stats={stats}
              plants={plants}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />

            {/* Results Section */}
            {filteredPlants.length === 0 && !loading ? (
              <PlantsEmptyState 
                activeFilter={activeFilter}
                onAddPlant={handleAddPlant}
                showAddButton={activeFilter !== 'harvested'}
                searchTerm={searchTerm}
              />
            ) : (
              <>
                {/* Virtualized List for Large Datasets */}
                {optimalViewMode === 'virtualized' && (
                  <PlantsVirtualizedList
                    plants={filteredPlants}
                    onView={handleView}
                    onClone={handleClone}
                    onHarvest={handleHarvest}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onLoadMore={loadMorePlants}
                    hasMore={hasMore}
                    loading={loadingMore}
                    height={600}
                    enableVirtualization={true}
                  />
                )}

                {/* Desktop Table */}
                {optimalViewMode === 'table' && (
                  <div className="hidden md:block">
                    <PlantsTable 
                      plants={filteredPlants}
                      onView={handleView}
                      onClone={handleClone}
                      onHarvest={handleHarvest}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                    
                    {/* Load More for Table View */}
                    {hasMore && (
                      <div className="text-center py-6">
                        <button
                          onClick={loadMorePlants}
                          disabled={loadingMore}
                          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2 inline-block"></div>
                              Loading...
                            </>
                          ) : (
                            'Load More Plants'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Cards */}
                {(optimalViewMode === 'cards' || optimalViewMode === 'table') && (
                  <div className="md:hidden">
                    <PlantsMobileCards 
                      plants={filteredPlants}
                      onView={handleView}
                      onClone={handleClone}
                      onHarvest={handleHarvest}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                    
                    {/* Load More for Mobile */}
                    {hasMore && (
                      <div className="text-center py-6">
                        <button
                          onClick={loadMorePlants}
                          disabled={loadingMore}
                          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2 inline-block"></div>
                              Loading...
                            </>
                          ) : (
                            'Load More Plants'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Error State for Load More */}
                {error && plants.length > 0 && (
                  <div className="text-center py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                      <p className="text-red-700 text-sm mb-2">
                        Failed to load more plants
                      </p>
                      <button
                        onClick={loadPlants}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
    </MultiSelectProvider>
  );
};

export default PlantsList;
