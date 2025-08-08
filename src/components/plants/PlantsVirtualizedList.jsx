// src/components/plants/PlantsVirtualizedList.jsx
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Virtualized list item component
const VirtualizedPlantCard = memo(({ 
  plant, 
  onView, 
  onClone, 
  onHarvest, 
  formatDate, 
  getStatusBadge,
  style 
}) => {
  const badge = getStatusBadge(plant);
  
  return (
    <div style={style} className="px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          {/* Plant Image */}
          {(plant.imageUrl || plant.image) ? (
            <img
              src={plant.imageUrl || plant.image}
              alt={plant.name}
              className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-500 text-2xl">🌱</span>
            </div>
          )}
          
          {/* Plant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {plant.name}
              </h3>
              <span className={badge.className}>
                {badge.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Strain:</span> {plant.strain}
              </div>
              {plant.uid && (
                <div>
                  <span className="font-medium">UID:</span>{' '}
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {plant.uid}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium">Origin:</span>{' '}
                {plant.origin || (plant.isClone ? 'Clone' : 'Seed')}
              </div>
              <div>
                <span className="font-medium">Added:</span>{' '}
                {formatDate(plant.createdAt)}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => onView(plant.id)}
                className="text-patriot-blue hover:text-blue-700 text-sm font-medium"
              >
                View Details
              </button>
              {!plant.harvested && plant.status !== 'harvested' && (
                <>
                  <button
                    onClick={() => onClone(plant)}
                    className="text-patriot-red hover:text-red-700 text-sm font-medium"
                  >
                    Clone
                  </button>
                  <button
                    onClick={() => onHarvest(plant)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Harvest
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualizedPlantCard.displayName = 'VirtualizedPlantCard';

// Simple virtualization implementation
const VirtualizedList = ({ 
  items, 
  itemHeight = 140, 
  containerHeight = 600,
  onView,
  onClone,
  onHarvest,
  formatDate,
  getStatusBadge,
  onLoadMore,
  hasMore,
  loading,
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeightState, setContainerHeightState] = React.useState(containerHeight);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeightState / itemHeight);
    const end = Math.min(start + visibleCount + 2, items.length); // +2 for buffer
    
    return { start: Math.max(0, start - 1), end }; // -1 for buffer
  }, [scrollTop, itemHeight, containerHeightState, items.length]);

  // Handle scroll with throttling
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    
    // Load more when near bottom
    if (hasMore && !loading) {
      const scrollHeight = e.target.scrollHeight;
      const clientHeight = e.target.clientHeight;
      const scrollPosition = scrollTop + clientHeight;
      
      if (scrollPosition >= scrollHeight - 200) { // 200px before bottom
        onLoadMore();
      }
    }
  }, [hasMore, loading, onLoadMore]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeightState(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Render visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
      const actualIndex = visibleRange.start + index;
      return (
        <VirtualizedPlantCard
          key={item.id}
          plant={item}
          onView={onView}
          onClone={onClone}
          onHarvest={onHarvest}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
        />
      );
    });
  }, [items, visibleRange, itemHeight, onView, onClone, onHarvest, formatDate, getStatusBadge]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-gray-50"
      style={{ height: containerHeightState }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-patriot-blue mr-2"></div>
            <span className="text-sm text-gray-600">Loading more plants...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main virtualized plants list component
const PlantsVirtualizedList = ({
  plants,
  onView,
  onClone,
  onHarvest,
  formatDate,
  getStatusBadge,
  onLoadMore,
  hasMore,
  loading,
  height = 600,
  enableVirtualization = true,
}) => {
  // If virtualization is disabled or few items, render normally
  if (!enableVirtualization || plants.length < 20) {
    return (
      <div className="space-y-4">
        {plants.map((plant) => (
          <VirtualizedPlantCard
            key={plant.id}
            plant={plant}
            onView={onView}
            onClone={onClone}
            onHarvest={onHarvest}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            style={{}} // No positioning for normal render
          />
        ))}
        
        {/* Load more button for non-virtualized */}
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
    );
  }

  // Render virtualized list for large datasets
  return (
    <VirtualizedList
      items={plants}
      itemHeight={140}
      containerHeight={height}
      onView={onView}
      onClone={onClone}
      onHarvest={onHarvest}
      formatDate={formatDate}
      getStatusBadge={getStatusBadge}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
    />
  );
};

VirtualizedPlantCard.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    strain: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    image: PropTypes.string,
    status: PropTypes.string,
    harvested: PropTypes.bool,
    createdAt: PropTypes.any,
    uid: PropTypes.string,
    origin: PropTypes.string,
    isClone: PropTypes.bool,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onHarvest: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
  style: PropTypes.object,
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  onView: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onHarvest: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  loading: PropTypes.bool,
};

PlantsVirtualizedList.propTypes = {
  plants: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onHarvest: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  loading: PropTypes.bool,
  height: PropTypes.number,
  enableVirtualization: PropTypes.bool,
};

export default memo(PlantsVirtualizedList);
