// src/components/dashboard/DashboardStats.jsx
import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ value, label, color = 'patriot-navy', onClick, isClickable = false }) => {
  const baseClasses = "bg-white rounded-lg p-4 shadow-sm transition-all duration-200";
  const clickableClasses = isClickable 
    ? "cursor-pointer hover:shadow-md hover:scale-105" 
    : "";
  
  const colorClasses = {
    'patriot-navy': 'text-patriot-navy',
    'patriot-red': 'text-patriot-red',
    'patriot-blue': 'text-patriot-blue',
    'green': 'text-green-600',
    'gray': 'text-gray-600',
  };

  const Component = isClickable ? 'button' : 'div';

  return (
    <Component 
      className={`${baseClasses} ${clickableClasses}`}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={isClickable ? `View ${label.toLowerCase()}` : undefined}
    >
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </Component>
  );
};

const DashboardStats = ({ 
  stats, 
  loading = false, 
  onStatsClick,
  hasPlants = false 
}) => {
  if (loading) {
    return (
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-patriot-blue mr-2"></div>
          <span className="text-gray-600">Loading your plants...</span>
        </div>
      </div>
    );
  }

  if (!hasPlants) {
    return (
      <div className="mt-8 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your stats will appear here</h3>
          <p className="text-sm text-gray-500">
            Add your first plant to start tracking your growing progress and statistics.
          </p>
        </div>
      </div>
    );
  }

  const statsConfig = [
    {
      key: 'active',
      value: stats.active || 0,
      label: 'Active Plants',
      color: 'green',
      isClickable: true,
    },
    {
      key: 'clones',
      value: stats.clones || 0,
      label: 'Clones Made',
      color: 'patriot-red',
      isClickable: true,
    },
    {
      key: 'harvested',
      value: stats.harvested || 0,
      label: 'Harvested',
      color: 'patriot-blue',
      isClickable: true,
    },
  ];

  return (
    <div className="mt-8 text-center">
      <h3 className="text-lg font-semibold text-patriot-navy mb-4">Quick Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
        {statsConfig.map((stat) => (
          <StatCard
            key={stat.key}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            isClickable={stat.isClickable && onStatsClick}
            onClick={() => onStatsClick && onStatsClick(stat.key)}
          />
        ))}
      </div>
      
      {stats.total > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total Plants: {stats.total}
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['patriot-navy', 'patriot-red', 'patriot-blue', 'green', 'gray']),
  onClick: PropTypes.func,
  isClickable: PropTypes.bool,
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    clones: PropTypes.number,
    harvested: PropTypes.number,
  }).isRequired,
  loading: PropTypes.bool,
  onStatsClick: PropTypes.func,
  hasPlants: PropTypes.bool,
};

export default DashboardStats;
