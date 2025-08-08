import React from 'react';
import PropTypes from 'prop-types';

const PlantsStatsFilters = ({ stats, plants, activeFilter, onFilterChange }) => {
  const filterConfigs = [
    {
      key: 'all',
      label: 'Total Plants',
      value: stats.totalPlants || plants.length,
      bgClass: 'bg-white',
      ringClass: 'ring-patriot-blue',
      bgActiveClass: 'bg-blue-50',
      textClass: 'text-patriot-navy'
    },
    {
      key: 'active',
      label: 'Active',
      value: stats.activePlants || plants.filter(p => p.status !== 'harvested' && !p.harvested).length,
      bgClass: 'bg-white',
      ringClass: 'ring-green-500',
      bgActiveClass: 'bg-green-50',
      textClass: 'text-green-600'
    },
    {
      key: 'harvested',
      label: 'Harvested',
      value: stats.harvestedPlants || plants.filter(p => p.status === 'harvested' || p.harvested).length,
      bgClass: 'bg-white',
      ringClass: 'ring-gray-500',
      bgActiveClass: 'bg-gray-50',
      textClass: 'text-gray-600'
    },
    {
      key: 'clones',
      label: 'Clones',
      value: stats.totalClones || plants.filter(p => p.isClone || p.origin === 'Clone').length,
      bgClass: 'bg-white',
      ringClass: 'ring-patriot-blue',
      bgActiveClass: 'bg-blue-50',
      textClass: 'text-patriot-blue'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {filterConfigs.map((config) => (
        <button
          key={config.key}
          onClick={() => onFilterChange(config.key)}
          className={`${config.bgClass} rounded-lg p-4 shadow-sm text-left transition-all hover:shadow-md ${
            activeFilter === config.key 
              ? `ring-2 ${config.ringClass} ${config.bgActiveClass}` 
              : ''
          }`}
        >
          <div className={`text-2xl font-bold ${config.textClass}`}>
            {config.value}
          </div>
          <div className="text-sm text-gray-600">{config.label}</div>
        </button>
      ))}
    </div>
  );
};

PlantsStatsFilters.propTypes = {
  stats: PropTypes.object.isRequired,
  plants: PropTypes.array.isRequired,
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default PlantsStatsFilters;
