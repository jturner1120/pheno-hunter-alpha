// src/components/dashboard/RecentPlantsWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';

const PlantCard = ({ plant, onViewPlant, formatDate }) => {
  const getStatusBadge = (plant) => {
    if (plant.status === 'harvested' || plant.harvested) {
      return { className: 'bg-gray-100 text-gray-800', label: '🌾 Harvested' };
    }
    return { className: 'bg-green-100 text-green-800', label: '🌱 Growing' };
  };

  const badge = getStatusBadge(plant);

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewPlant(plant.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewPlant(plant.id)}
      aria-label={`View details for ${plant.name}`}
    >
      <div className="flex items-center space-x-3">
        {(plant.imageUrl || plant.image) ? (
          <img
            src={plant.imageUrl || plant.image}
            alt={plant.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">🌱</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {plant.name}
          </h4>
          <p className="text-xs text-gray-500">
            {plant.strain}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(plant.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentPlantsWidget = ({ 
  recentPlants, 
  onViewPlant, 
  onViewAllPlants,
  loading = false 
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-patriot-blue mr-2"></div>
          <span className="text-gray-600">Loading recent plants...</span>
        </div>
      </div>
    );
  }

  if (!recentPlants || recentPlants.length === 0) {
    return null; // Don't show widget if no recent plants
  }

  return (
    <div className="mt-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-patriot-navy">Recent Plants</h3>
          <button
            onClick={onViewAllPlants}
            className="text-sm text-patriot-blue hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-3">
          {recentPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onViewPlant={onViewPlant}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

PlantCard.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    strain: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    image: PropTypes.string,
    status: PropTypes.string,
    harvested: PropTypes.bool,
    createdAt: PropTypes.any,
  }).isRequired,
  onViewPlant: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

RecentPlantsWidget.propTypes = {
  recentPlants: PropTypes.arrayOf(PropTypes.object),
  onViewPlant: PropTypes.func.isRequired,
  onViewAllPlants: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default RecentPlantsWidget;
