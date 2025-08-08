import React from 'react';
import PropTypes from 'prop-types';
import { useMultiSelect } from './bulk/MultiSelectProvider';

const PlantsMobileCards = ({ 
  plants, 
  onView, 
  onClone, 
  onHarvest, 
  formatDate, 
  getStatusBadge 
}) => {
  const { selectedPlants, togglePlant, selectMode } = useMultiSelect();

  const isSelected = (plantId) => selectedPlants.has(plantId);

  const handleCardClick = (plant, event) => {
    // Prevent card selection when clicking action buttons
    if (event.target.closest('button')) {
      return;
    }
    
    if (selectMode) {
      togglePlant(plant.id);
    }
  };
  return (
    <div className="md:hidden space-y-4">
      {plants.map((plant) => (
        <div 
          key={plant.id} 
          className={`card cursor-pointer transition-all ${
            isSelected(plant.id) ? 'ring-2 ring-patriot-blue bg-blue-50' : ''
          } ${selectMode ? 'select-none' : ''}`}
          onClick={(e) => handleCardClick(plant, e)}
        >
          <div className="flex items-start space-x-4">
            {selectMode && (
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isSelected(plant.id)}
                  onChange={() => togglePlant(plant.id)}
                  className="h-4 w-4 text-patriot-blue focus:ring-patriot-blue border-gray-300 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {(plant.imageUrl || plant.image) ? (
              <img
                src={plant.imageUrl || plant.image}
                alt={plant.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">🌱</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {plant.name}
                </h3>
                {(() => {
                  const badge = getStatusBadge(plant);
                  return <span className={badge.className}>{badge.label}</span>;
                })()}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Strain:</span> {plant.strain}</p>
                {plant.uid && (
                  <p>
                    <span className="font-medium">UID:</span>{' '}
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {plant.uid}
                    </span>
                  </p>
                )}
                <p>
                  <span className="font-medium">Origin:</span>{' '}
                  {plant.origin || (plant.isClone ? 'Clone' : 'Seed') === 'Seed' ? '🌰' : '🌿'}{' '}
                  {plant.origin || (plant.isClone ? 'Clone' : 'Seed')}
                </p>
                <p>
                  <span className="font-medium">Planted:</span>{' '}
                  {formatDate(plant.plantedDate || plant.datePlanted)}
                </p>
                <p>
                  <span className="font-medium">Generation:</span>{' '}
                  {(plant.cloneGeneration || 0) + 1}
                </p>
              </div>
              <div className="mt-4 flex space-x-3">
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
      ))}
    </div>
  );
};

PlantsMobileCards.propTypes = {
  plants: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onHarvest: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired
};

export default PlantsMobileCards;
