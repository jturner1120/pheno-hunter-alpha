// src/hooks/useAnalytics.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getUserPlants, getPlantMetrics, getPlantTimeline } from '../utils/firestore';
import { logInfo, logError } from '../utils/logger';

const useAnalytics = (timeRange = '30d', plantIds = []) => {
  const { user } = useAuth();
  
  // State management
  const [plants, setPlants] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedPlants, setSelectedPlants] = useState(plantIds);

  // Time range options - memoized to prevent infinite re-renders
  const timeRangeOptions = useMemo(() => [
    { value: '7d', label: '7 Days', days: 7 },
    { value: '30d', label: '30 Days', days: 30 },
    { value: '90d', label: '3 Months', days: 90 },
    { value: '6m', label: '6 Months', days: 180 },
    { value: '1y', label: '1 Year', days: 365 },
    { value: 'all', label: 'All Time', days: null }
  ], []);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logInfo('Loading analytics data', { 
        userId: user.id, 
        timeRange: selectedTimeRange,
        selectedPlants 
      });

      const timeRangeConfig = timeRangeOptions.find(tr => tr.value === selectedTimeRange);
      const startDate = timeRangeConfig?.days 
        ? new Date(Date.now() - timeRangeConfig.days * 24 * 60 * 60 * 1000)
        : null;

      const [plantsData, metricsData, timelineData] = await Promise.all([
        getUserPlants(user.id),
        getPlantMetrics(user.id, {
          plantIds: selectedPlants.length > 0 ? selectedPlants : null,
          startDate,
          endDate: new Date()
        }),
        getPlantTimeline(user.id, {
          plantIds: selectedPlants.length > 0 ? selectedPlants : null,
          startDate,
          endDate: new Date()
        })
      ]);

      setPlants(plantsData || []);
      setMetrics(metricsData || []);
      setTimeline(timelineData || []);

      // Debug logging
      console.log('Analytics Debug:', {
        plantsLoaded: plantsData?.length || 0,
        metricsLoaded: metricsData?.length || 0,
        timelineLoaded: timelineData?.length || 0,
        plants: plantsData,
        metrics: metricsData,
        timeline: timelineData
      });

      logInfo('Analytics data loaded successfully', {
        plantsCount: plantsData?.length || 0,
        metricsCount: metricsData?.length || 0,
        timelineCount: timelineData?.length || 0
      });

    } catch (error) {
      logError(error, { operation: 'loadAnalyticsData' });
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedTimeRange, selectedPlants.join(',')]); // Use join to create stable string comparison

  // Growth analytics calculations
  const growthAnalytics = useMemo(() => {
    if (!metrics.length) return null;

    const groupedMetrics = metrics.reduce((acc, metric) => {
      const plantId = metric.plantId;
      if (!acc[plantId]) acc[plantId] = [];
      acc[plantId].push(metric);
      return acc;
    }, {});

    const analytics = {};

    Object.entries(groupedMetrics).forEach(([plantId, plantMetrics]) => {
      const sortedMetrics = plantMetrics.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      const first = sortedMetrics[0];
      const last = sortedMetrics[sortedMetrics.length - 1];

      analytics[plantId] = {
        totalGrowth: {
          height: last.height - first.height,
          width: last.width - first.width,
          nodes: last.nodeCount - first.nodeCount
        },
        averageGrowthRate: {
          height: calculateGrowthRate(sortedMetrics, 'height'),
          width: calculateGrowthRate(sortedMetrics, 'width'),
          nodes: calculateGrowthRate(sortedMetrics, 'nodeCount')
        },
        growthTrend: calculateTrend(sortedMetrics),
        metricsCount: sortedMetrics.length,
        timespan: Math.ceil((new Date(last.timestamp) - new Date(first.timestamp)) / (1000 * 60 * 60 * 24))
      };
    });

    return analytics;
  }, [metrics]);

  // Helper function to calculate growth rate
  const calculateGrowthRate = (metrics, field) => {
    if (metrics.length < 2) return 0;
    
    const validMetrics = metrics.filter(m => m[field] != null);
    if (validMetrics.length < 2) return 0;

    const totalGrowth = validMetrics[validMetrics.length - 1][field] - validMetrics[0][field];
    const timespan = (new Date(validMetrics[validMetrics.length - 1].timestamp) - 
                     new Date(validMetrics[0].timestamp)) / (1000 * 60 * 60 * 24);
    
    return timespan > 0 ? totalGrowth / timespan : 0;
  };

  // Helper function to calculate trend
  const calculateTrend = (metrics) => {
    if (metrics.length < 3) return 'insufficient-data';
    
    const recentMetrics = metrics.slice(-3);
    const heightTrend = recentMetrics[2].height - recentMetrics[0].height;
    
    if (heightTrend > 2) return 'accelerating';
    if (heightTrend > 0) return 'steady';
    if (heightTrend === 0) return 'stable';
    return 'declining';
  };

  // Strain performance analytics
  const strainAnalytics = useMemo(() => {
    if (!plants.length) return null;

    const strainGroups = plants.reduce((acc, plant) => {
      const strain = plant.strain;
      if (!acc[strain]) {
        acc[strain] = {
          plants: [],
          totalYield: 0,
          averageYield: 0,
          averageGrowthTime: 0,
          successRate: 0,
          totalHarvested: 0
        };
      }
      acc[strain].plants.push(plant);
      return acc;
    }, {});

    Object.entries(strainGroups).forEach(([strain, data]) => {
      const plants = data.plants;
      const harvestedPlants = plants.filter(p => p.status === 'harvested' && p.harvestData?.weight);
      
      data.totalHarvested = harvestedPlants.length;
      data.successRate = plants.length > 0 ? (harvestedPlants.length / plants.length) * 100 : 0;
      
      if (harvestedPlants.length > 0) {
        data.totalYield = harvestedPlants.reduce((sum, p) => sum + (p.harvestData?.weight || 0), 0);
        data.averageYield = data.totalYield / harvestedPlants.length;
        
        const growthTimes = harvestedPlants
          .filter(p => p.plantedDate && p.harvestData?.harvestDate)
          .map(p => {
            const planted = p.plantedDate.toDate ? p.plantedDate.toDate() : new Date(p.plantedDate);
            const harvested = p.harvestData.harvestDate.toDate ? 
              p.harvestData.harvestDate.toDate() : new Date(p.harvestData.harvestDate);
            return Math.ceil((harvested - planted) / (1000 * 60 * 60 * 24));
          });
        
        data.averageGrowthTime = growthTimes.length > 0 
          ? growthTimes.reduce((sum, time) => sum + time, 0) / growthTimes.length 
          : 0;
      }
    });

    return strainGroups;
  }, [plants]);

  // Timeline analytics
  const timelineAnalytics = useMemo(() => {
    if (!timeline.length) return null;

    const events = timeline.map(event => ({
      ...event,
      date: event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp),
      week: getWeekKey(event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp))
    }));

    const weeklyActivity = events.reduce((acc, event) => {
      const week = event.week;
      if (!acc[week]) {
        acc[week] = {
          week,
          events: 0,
          plants: new Set(),
          stages: new Set(),
          activities: []
        };
      }
      acc[week].events++;
      acc[week].plants.add(event.plantId);
      if (event.type === 'stage_change') acc[week].stages.add(event.newStage);
      acc[week].activities.push(event);
      return acc;
    }, {});

    // Convert sets to counts
    Object.values(weeklyActivity).forEach(week => {
      week.uniquePlants = week.plants.size;
      week.uniqueStages = week.stages.size;
      week.plants = Array.from(week.plants);
      week.stages = Array.from(week.stages);
    });

    return {
      weeklyActivity: Object.values(weeklyActivity).sort((a, b) => a.week.localeCompare(b.week)),
      totalEvents: events.length,
      activePeriods: Object.keys(weeklyActivity).length,
      averageWeeklyActivity: events.length / Math.max(Object.keys(weeklyActivity).length, 1)
    };
  }, [timeline]);

  // Helper function to get week key
  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const week = Math.ceil(((date - new Date(year, 0, 1)) / 86400000 + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!metrics.length) return null;

    // Growth over time chart data
    const growthData = metrics
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(metric => ({
        date: metric.timestamp.toDate ? metric.timestamp.toDate().toISOString().split('T')[0] : 
              new Date(metric.timestamp).toISOString().split('T')[0],
        height: metric.height || 0,
        width: metric.width || 0,
        nodes: metric.nodeCount || 0,
        plantId: metric.plantId,
        plantName: plants.find(p => p.id === metric.plantId)?.name || 'Unknown'
      }));

    // Strain comparison data
    const strainComparisonData = strainAnalytics ? 
      Object.entries(strainAnalytics).map(([strain, data]) => ({
        strain,
        averageYield: Math.round(data.averageYield * 10) / 10,
        successRate: Math.round(data.successRate),
        averageGrowthTime: Math.round(data.averageGrowthTime),
        plantsCount: data.plants.length,
        harvestedCount: data.totalHarvested
      })) : [];

    // Activity timeline data
    const activityData = timelineAnalytics ? 
      timelineAnalytics.weeklyActivity.map(week => ({
        week: week.week,
        events: week.events,
        plants: week.uniquePlants,
        date: week.week // For chart x-axis
      })) : [];

    return {
      growth: growthData,
      strainComparison: strainComparisonData,
      activity: activityData
    };
  }, [metrics, plants, strainAnalytics, timelineAnalytics]);

  // Export data handlers
  const exportAnalytics = useCallback(async (format = 'csv') => {
    try {
      const data = {
        summary: {
          timeRange: selectedTimeRange,
          totalPlants: plants.length,
          metricsRecorded: metrics.length,
          timelineEvents: timeline.length,
          generatedAt: new Date().toISOString()
        },
        growthAnalytics,
        strainAnalytics,
        timelineAnalytics,
        chartData
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phenohunter-analytics-${selectedTimeRange}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert chart data to CSV
        let csvContent = '';
        
        if (chartData?.growth?.length) {
          csvContent += 'Plant Growth Data\n';
          csvContent += 'Date,Plant Name,Height (cm),Width (cm),Nodes\n';
          chartData.growth.forEach(row => {
            csvContent += `${row.date},${row.plantName},${row.height},${row.width},${row.nodes}\n`;
          });
          csvContent += '\n';
        }

        if (chartData?.strainComparison?.length) {
          csvContent += 'Strain Performance\n';
          csvContent += 'Strain,Average Yield (g),Success Rate (%),Average Growth Time (days),Total Plants,Harvested\n';
          chartData.strainComparison.forEach(row => {
            csvContent += `${row.strain},${row.averageYield},${row.successRate},${row.averageGrowthTime},${row.plantsCount},${row.harvestedCount}\n`;
          });
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phenohunter-analytics-${selectedTimeRange}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      logInfo('Analytics data exported', { format, timeRange: selectedTimeRange });
    } catch (error) {
      logError(error, { operation: 'exportAnalytics', format });
      throw new Error('Failed to export analytics data');
    }
  }, [selectedTimeRange, plants, metrics, timeline, growthAnalytics, strainAnalytics, timelineAnalytics, chartData]);

  // Change handlers
  const handleTimeRangeChange = useCallback((newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
  }, []);

  const handlePlantSelectionChange = useCallback((plantIds) => {
    setSelectedPlants(plantIds);
  }, []);

  // Load data effect - stable dependencies
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return {
    // State
    plants,
    metrics,
    timeline,
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
    hasData: metrics.length > 0 || timeline.length > 0,
    isEmpty: plants.length === 0
  };
};

export default useAnalytics;
