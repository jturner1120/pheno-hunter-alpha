// src/components/analytics/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useAnalytics from '../../hooks/useAnalytics';
import AnalyticsHeader from './AnalyticsHeader';
import AnalyticsFilters from './AnalyticsFilters';
import GrowthChart from './GrowthChart';
import StrainPerformanceChart from './StrainPerformanceChart';
import ActivityTimelineChart from './ActivityTimelineChart';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import { AnalyticsLoadingState, AnalyticsErrorState, AnalyticsEmptyState } from './AnalyticsStates';

const AnalyticsDashboard = () => {
  const [selectedView, setSelectedView] = useState('overview');
  
  const {
    // State
    plants,
    loading,
    error,
    
    // Configuration
    selectedTimeRange,
    selectedPlants,
    timeRangeOptions,
    
    // Analytics
    growthAnalytics,
    strainAnalytics,
    timelineAnalytics,
    chartData,
    
    // Actions
    loadAnalyticsData,
    handleTimeRangeChange,
    handlePlantSelectionChange,
    exportAnalytics,
    
    // Computed values
    hasData,
    isEmpty
  } = useAnalytics();

  // Debug logging
  console.log('Analytics Dashboard State:', {
    loading,
    error,
    isEmpty,
    hasData,
    plantsCount: plants?.length || 0,
    growthAnalytics,
    strainAnalytics,
    timelineAnalytics,
    chartData
  });

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleRetry = () => {
    loadAnalyticsData();
  };

  const handleExport = async (format) => {
    try {
      await exportAnalytics(format);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Export failed:', error);
    }
  };

  // Loading state
  if (loading) {
    return <AnalyticsLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <AnalyticsErrorState 
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // Empty state
  if (isEmpty) {
    return <AnalyticsEmptyState />;
  }

  // No data state (has plants but no metrics/timeline)
  if (!hasData) {
    return (
      <div className="min-h-screen bg-patriot-gray">
        <AnalyticsHeader 
          onExport={handleExport}
          hasData={false}
        />
        <main className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Analytics Data Yet
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Start recording plant measurements and tracking activities to see your analytics data here.
            </p>
            <div className="space-y-4 text-left bg-white rounded-lg p-6 max-w-lg mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">To see analytics:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Record plant measurements (height, width, nodes)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Track plant stage changes
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Log harvest data with weights
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Add notes and observations
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-patriot-gray">
      <AnalyticsHeader 
        onExport={handleExport}
        hasData={hasData}
      />
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <AnalyticsFilters
          selectedTimeRange={selectedTimeRange}
          selectedPlants={selectedPlants}
          timeRangeOptions={timeRangeOptions}
          plants={plants}
          selectedView={selectedView}
          onTimeRangeChange={handleTimeRangeChange}
          onPlantSelectionChange={handlePlantSelectionChange}
          onViewChange={handleViewChange}
        />

        {/* Summary Cards */}
        <AnalyticsSummaryCards
          growthAnalytics={growthAnalytics}
          strainAnalytics={strainAnalytics}
          timelineAnalytics={timelineAnalytics}
          selectedPlants={selectedPlants}
          plants={plants}
        />

        {/* Charts based on selected view */}
        <div className="space-y-8">
          {(selectedView === 'overview' || selectedView === 'growth') && chartData?.growth?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Plant Growth Over Time</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Track height, width, and node development across selected plants
                </p>
              </div>
              <div className="p-6">
                <GrowthChart 
                  data={chartData.growth}
                  selectedPlants={selectedPlants}
                  plants={plants}
                />
              </div>
            </div>
          )}

          {(selectedView === 'overview' || selectedView === 'strains') && chartData?.strainComparison?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Strain Performance Comparison</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Compare yield, success rate, and growth time across different strains
                </p>
              </div>
              <div className="p-6">
                <StrainPerformanceChart 
                  data={chartData.strainComparison}
                  strainAnalytics={strainAnalytics}
                />
              </div>
            </div>
          )}

          {(selectedView === 'overview' || selectedView === 'activity') && chartData?.activity?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Weekly activity patterns and plant management trends
                </p>
              </div>
              <div className="p-6">
                <ActivityTimelineChart 
                  data={chartData.activity}
                  timelineAnalytics={timelineAnalytics}
                />
              </div>
            </div>
          )}

          {/* Detailed Analytics Views */}
          {selectedView === 'detailed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Growth Trends */}
              {growthAnalytics && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Growth Trends</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(growthAnalytics).map(([plantId, analytics]) => {
                        const plant = plants.find(p => p.id === plantId);
                        if (!plant) return null;

                        return (
                          <div key={plantId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{plant.name}</h4>
                                <p className="text-sm text-gray-500">{plant.strain}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                analytics.growthTrend === 'accelerating' ? 'bg-green-100 text-green-800' :
                                analytics.growthTrend === 'steady' ? 'bg-blue-100 text-blue-800' :
                                analytics.growthTrend === 'stable' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {analytics.growthTrend}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Height Growth:</span>
                                <div className="font-medium">+{analytics.totalGrowth.height.toFixed(1)} cm</div>
                                <div className="text-xs text-gray-500">
                                  {analytics.averageGrowthRate.height.toFixed(2)} cm/day
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Width Growth:</span>
                                <div className="font-medium">+{analytics.totalGrowth.width.toFixed(1)} cm</div>
                                <div className="text-xs text-gray-500">
                                  {analytics.averageGrowthRate.width.toFixed(2)} cm/day
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Node Growth:</span>
                                <div className="font-medium">+{analytics.totalGrowth.nodes}</div>
                                <div className="text-xs text-gray-500">
                                  {analytics.averageGrowthRate.nodes.toFixed(2)} nodes/day
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              {analytics.metricsCount} measurements over {analytics.timespan} days
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Strain Details */}
              {strainAnalytics && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Strain Performance Details</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(strainAnalytics)
                        .sort(([,a], [,b]) => b.successRate - a.successRate)
                        .map(([strain, data]) => (
                          <div key={strain} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">{strain}</h4>
                              <span className="text-sm text-gray-500">
                                {data.plants.length} plants
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Success Rate:</span>
                                <div className="font-medium text-green-600">
                                  {data.successRate.toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Avg. Yield:</span>
                                <div className="font-medium">
                                  {data.averageYield.toFixed(1)}g
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Avg. Growth Time:</span>
                                <div className="font-medium">
                                  {data.averageGrowthTime.toFixed(0)} days
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Harvested:</span>
                                <div className="font-medium">
                                  {data.totalHarvested}/{data.plants.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

AnalyticsDashboard.propTypes = {
  // No props needed as this is a top-level component
};

export default AnalyticsDashboard;
