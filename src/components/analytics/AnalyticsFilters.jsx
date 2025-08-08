// src/components/analytics/AnalyticsFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AnalyticsFilters = ({
  selectedTimeRange,
  selectedPlants,
  timeRangeOptions,
  plants,
  selectedView,
  onTimeRangeChange,
  onPlantSelectionChange,
  onViewChange
}) => {
  const viewOptions = [
    { value: 'overview', label: 'Overview', icon: '📊' },
    { value: 'growth', label: 'Growth', icon: '📈' },
    { value: 'strains', label: 'Strains', icon: '🌿' },
    { value: 'activity', label: 'Activity', icon: '📅' },
    { value: 'detailed', label: 'Detailed', icon: '🔍' }
  ];

  const handlePlantToggle = (plantId) => {
    const newSelection = selectedPlants.includes(plantId)
      ? selectedPlants.filter(id => id !== plantId)
      : [...selectedPlants, plantId];
    onPlantSelectionChange(newSelection);
  };

  const handleSelectAllPlants = () => {
    onPlantSelectionChange(plants.map(p => p.id));
  };

  const handleClearPlantSelection = () => {
    onPlantSelectionChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* View Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View
            </label>
            <div className="flex flex-wrap gap-2">
              {viewOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onViewChange(option.value)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedView === option.value
                      ? 'bg-patriot-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Selector */}
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              id="time-range"
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-patriot-blue focus:border-patriot-blue sm:text-sm"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plant Filter */}
        {plants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Filter by Plants ({selectedPlants.length === 0 ? 'All' : selectedPlants.length} selected)
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAllPlants}
                  className="text-xs text-patriot-blue hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearPlantSelection}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
              {plants.map(plant => (
                <label
                  key={plant.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlants.length === 0 || selectedPlants.includes(plant.id)}
                    onChange={() => handlePlantToggle(plant.id)}
                    className="h-4 w-4 text-patriot-blue focus:ring-patriot-blue border-gray-300 rounded"
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {plant.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {plant.strain}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        plant.status === 'vegetative' ? 'bg-green-100 text-green-800' :
                        plant.status === 'flowering' ? 'bg-purple-100 text-purple-800' :
                        plant.status === 'seedling' ? 'bg-yellow-100 text-yellow-800' :
                        plant.status === 'harvested' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {plant.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AnalyticsFilters.propTypes = {
  selectedTimeRange: PropTypes.string.isRequired,
  selectedPlants: PropTypes.array.isRequired,
  timeRangeOptions: PropTypes.array.isRequired,
  plants: PropTypes.array.isRequired,
  selectedView: PropTypes.string.isRequired,
  onTimeRangeChange: PropTypes.func.isRequired,
  onPlantSelectionChange: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired
};

export default AnalyticsFilters;
