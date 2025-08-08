// src/components/analytics/AnalyticsSummaryCards.jsx
import React from 'react';
import PropTypes from 'prop-types';

const SummaryCard = ({ title, value, subtitle, icon, color = 'blue', trend = null }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const trendIcon = trend && (
    <div className={`flex items-center ml-2 text-xs ${
      trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
    }`}>
      {trend > 0 ? (
        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ) : trend < 0 ? (
        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {Math.abs(trend).toFixed(1)}%
    </div>
  );

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{value}</p>
            {trendIcon}
          </div>
          {subtitle && (
            <p className="text-sm opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl opacity-60">
          {icon}
        </div>
      </div>
    </div>
  );
};

const AnalyticsSummaryCards = ({
  growthAnalytics,
  strainAnalytics,
  timelineAnalytics,
  selectedPlants,
  plants
}) => {
  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    const filteredPlants = selectedPlants.length > 0 
      ? plants.filter(p => selectedPlants.includes(p.id))
      : plants;

    // Plant count
    const totalPlants = filteredPlants.length;
    const activePlants = filteredPlants.filter(p => p.status !== 'harvested').length;

    // Growth metrics
    let avgGrowthRate = 0;
    let totalMeasurements = 0;
    if (growthAnalytics) {
      const relevantAnalytics = Object.entries(growthAnalytics)
        .filter(([plantId]) => selectedPlants.length === 0 || selectedPlants.includes(plantId));
      
      if (relevantAnalytics.length > 0) {
        const totalHeightGrowthRate = relevantAnalytics.reduce((sum, [, analytics]) => 
          sum + analytics.averageGrowthRate.height, 0);
        avgGrowthRate = totalHeightGrowthRate / relevantAnalytics.length;
        totalMeasurements = relevantAnalytics.reduce((sum, [, analytics]) => 
          sum + analytics.metricsCount, 0);
      }
    }

    // Strain metrics
    let topStrain = null;
    let avgSuccessRate = 0;
    if (strainAnalytics) {
      const relevantStrains = Object.entries(strainAnalytics)
        .filter(([, data]) => 
          selectedPlants.length === 0 || 
          data.plants.some(p => selectedPlants.includes(p.id))
        );
      
      if (relevantStrains.length > 0) {
        topStrain = relevantStrains.sort(([,a], [,b]) => b.successRate - a.successRate)[0];
        avgSuccessRate = relevantStrains.reduce((sum, [, data]) => sum + data.successRate, 0) / relevantStrains.length;
      }
    }

    // Activity metrics
    let weeklyActivity = 0;
    let totalEvents = 0;
    if (timelineAnalytics) {
      weeklyActivity = timelineAnalytics.averageWeeklyActivity;
      totalEvents = timelineAnalytics.totalEvents;
    }

    return {
      totalPlants,
      activePlants,
      avgGrowthRate,
      totalMeasurements,
      topStrain,
      avgSuccessRate,
      weeklyActivity,
      totalEvents
    };
  }, [growthAnalytics, strainAnalytics, timelineAnalytics, selectedPlants, plants]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        title="Active Plants"
        value={summaryMetrics.activePlants}
        subtitle={`of ${summaryMetrics.totalPlants} total`}
        icon="🌱"
        color="green"
      />
      
      <SummaryCard
        title="Avg Growth Rate"
        value={summaryMetrics.avgGrowthRate.toFixed(2)}
        subtitle="cm/day height growth"
        icon="📈"
        color="blue"
      />

      <SummaryCard
        title="Success Rate"
        value={`${summaryMetrics.avgSuccessRate.toFixed(1)}%`}
        subtitle={summaryMetrics.topStrain ? `Best: ${summaryMetrics.topStrain[0]}` : 'Across all strains'}
        icon="🏆"
        color="purple"
      />

      <SummaryCard
        title="Weekly Activity"
        value={summaryMetrics.weeklyActivity.toFixed(1)}
        subtitle={`${summaryMetrics.totalEvents} total events`}
        icon="📊"
        color="orange"
      />
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'red']),
  trend: PropTypes.number
};

AnalyticsSummaryCards.propTypes = {
  growthAnalytics: PropTypes.object,
  strainAnalytics: PropTypes.object,
  timelineAnalytics: PropTypes.object,
  selectedPlants: PropTypes.array.isRequired,
  plants: PropTypes.array.isRequired
};

export default AnalyticsSummaryCards;
