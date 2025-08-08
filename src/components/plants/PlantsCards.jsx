import React from 'react';
import PropTypes from 'prop-types';
import { useMultiSelect } from './bulk/MultiSelectProvider';

const PlantsTable = ({ 
  plants, 
  onView, 
  onClone, 
  onHarvest, 
  formatDate, 
  getStatusBadge 
}) => {
  const { selectedPlants, togglePlant, selectMode } = useMultiSelect();

  const isSelected = (plantId) => selectedPlants.some(p => p.id === plantId);

  const handleRowClick = (plant, event) => {
    // Prevent row selection when clicking action buttons
    if (event.target.closest('button')) {
      return;
    }
    
    if (selectMode) {
      togglePlant(plant);
    }
  };
  return (
    <div className="hidden md:block card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={plants.length > 0 && plants.every(plant => isSelected(plant.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        plants.forEach(plant => {
                          if (!isSelected(plant.id)) {
                            togglePlant(plant);
                          }
                        });
                      } else {
                        plants.forEach(plant => {
                          if (isSelected(plant.id)) {
                            togglePlant(plant);
                          }
                        });
                      }
                    }}
                    className="h-4 w-4 text-patriot-blue focus:ring-patriot-blue border-gray-300 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plants.map((plant) => (
              <tr 
                key={plant.id} 
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected(plant.id) ? 'bg-blue-50 border-l-4 border-patriot-blue' : ''
                } ${selectMode ? 'select-none' : ''}`}
                onClick={(e) => handleRowClick(plant, e)}
              >
                {selectMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected(plant.id)}
                      onChange={() => togglePlant(plant)}
                      className="h-4 w-4 text-patriot-blue focus:ring-patriot-blue border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {(plant.imageUrl || plant.image) ? (
                      <img
                        src={plant.imageUrl || plant.image}
                        alt={plant.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-sm">🌱</span>
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {plant.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {plant.strain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {plant.uid ? (
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {plant.uid}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No UID</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {plant.origin || (plant.isClone ? 'Clone' : 'Seed') === 'Seed' ? '🌰' : '🌿'} {plant.origin || (plant.isClone ? 'Clone' : 'Seed')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(plant.plantedDate || plant.datePlanted)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Gen {(plant.cloneGeneration || 0) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const badge = getStatusBadge(plant);
                    return <span className={badge.className}>{badge.label}</span>;
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onView(plant.id)}
                    className="text-patriot-blue hover:text-blue-700"
                  >
                    View
                  </button>
                  {!plant.harvested && plant.status !== 'harvested' && (
                    <>
                      <button
                        onClick={() => onClone(plant)}
                        className="text-patriot-red hover:text-red-700"
                      >
                        Clone
                      </button>
                      <button
                        onClick={() => onHarvest(plant)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Harvest
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PlantsTable.propTypes = {
  plants: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onHarvest: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired
};

export default PlantsTable;
