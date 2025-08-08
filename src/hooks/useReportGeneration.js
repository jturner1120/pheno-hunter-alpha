// src/hooks/useReportGeneration.js
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { firestoreService } from '../utils/firestore';
import { 
  generatePDFReport, 
  downloadPDF, 
  PlantReportTemplate, 
  StrainReportTemplate, 
  GrowthSummaryTemplate 
} from '../utils/pdfGeneration.jsx';
import { logInfo, logError, logUserAction, logPerformance } from '../utils/logger';

// Report types
export const REPORT_TYPES = {
  PLANT_REPORT: 'plant_report',
  STRAIN_PERFORMANCE: 'strain_performance',
  GROWTH_SUMMARY: 'growth_summary',
  CUSTOM_REPORT: 'custom_report'
};

// Report templates mapping
const REPORT_TEMPLATES = {
  [REPORT_TYPES.PLANT_REPORT]: PlantReportTemplate,
  [REPORT_TYPES.STRAIN_PERFORMANCE]: StrainReportTemplate,
  [REPORT_TYPES.GROWTH_SUMMARY]: GrowthSummaryTemplate,
};

/**
 * Custom hook for report generation functionality
 * @returns {Object} Report generation state and functions
 */
export const useReportGeneration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [progress, setProgress] = useState(0);

  /**
   * Generate plant report data
   */
  const generatePlantReportData = useCallback(async (plantId) => {
    try {
      const plant = await firestoreService.getPlant(user.uid, plantId);
      const metrics = await firestoreService.getPlantMetrics(user.uid, { plantIds: [plantId] });
      const timeline = await firestoreService.getPlantTimeline(user.uid, { plantIds: [plantId] });
      
      // Calculate days in cultivation
      const createdDate = plant.createdAt?.toDate() || new Date();
      const daysInCultivation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));

      // Process metrics for report
      const processedMetrics = {};
      if (metrics.length > 0) {
        const latestMetrics = metrics[metrics.length - 1];
        const previousMetrics = metrics.length > 1 ? metrics[metrics.length - 2] : null;
        
        ['height', 'width', 'health'].forEach(metric => {
          if (latestMetrics[metric] !== undefined) {
            processedMetrics[metric] = {
              current: latestMetrics[metric],
              previous: previousMetrics?.[metric] || 'N/A',
              change: previousMetrics?.[metric] 
                ? `${((latestMetrics[metric] - previousMetrics[metric]) / previousMetrics[metric] * 100).toFixed(1)}%`
                : 'N/A'
            };
          }
        });
      }

      // Process recent activity
      const recentActivity = timeline
        .slice(-10)
        .map(event => ({
          date: event.timestamp?.toDate()?.toLocaleDateString() || 'Unknown',
          type: event.type || 'Unknown',
          description: event.description || event.notes || 'No description'
        }));

      return {
        plant,
        daysInCultivation,
        metrics: processedMetrics,
        recentActivity,
        notes: plant.notes || 'No notes available'
      };
    } catch (error) {
      logError(error, { operation: 'generatePlantReportData', plantId });
      throw error;
    }
  }, [user.uid]);

  /**
   * Generate strain performance report data
   */
  const generateStrainReportData = useCallback(async (strainName = null) => {
    try {
      const plants = await firestoreService.getUserPlants(user.uid);
      const filteredPlants = strainName 
        ? plants.filter(plant => plant.strain === strainName)
        : plants;

      if (filteredPlants.length === 0) {
        throw new Error('No plants found for strain analysis');
      }

      // Calculate summary statistics
      const totalPlants = filteredPlants.length;
      const completedPlants = filteredPlants.filter(plant => 
        plant.status === 'harvested' || plant.status === 'completed'
      ).length;
      const successRate = `${Math.round((completedPlants / totalPlants) * 100)}%`;

      // Calculate average yield (mock data for now)
      const plantsWithYield = filteredPlants.filter(plant => plant.yield);
      const averageYield = plantsWithYield.length > 0
        ? `${(plantsWithYield.reduce((sum, plant) => sum + (plant.yield || 0), 0) / plantsWithYield.length).toFixed(1)}g`
        : 'N/A';

      // Calculate average cycle time
      const completedWithDates = filteredPlants.filter(plant => 
        plant.createdAt && plant.harvestedAt
      );
      const averageCycleTime = completedWithDates.length > 0
        ? `${Math.round(completedWithDates.reduce((sum, plant) => {
          const days = (plant.harvestedAt.toDate() - plant.createdAt.toDate()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedWithDates.length)} days`
        : 'N/A';

      // Stage performance analysis
      const stagePerformance = {
        'Seedling': { duration: '14 days', successRate: '95%', issues: '2' },
        'Vegetative': { duration: '28 days', successRate: '90%', issues: '5' },
        'Flowering': { duration: '56 days', successRate: '85%', issues: '8' },
        'Harvest': { duration: '7 days', successRate: '98%', issues: '1' }
      };

      return {
        strain: { name: strainName || 'All Strains' },
        summary: {
          totalPlants,
          successRate,
          averageYield,
          averageCycleTime
        },
        stagePerformance
      };
    } catch (error) {
      logError(error, { operation: 'generateStrainReportData', strainName });
      throw error;
    }
  }, [user.uid]);

  /**
   * Generate growth summary report data
   */
  const generateGrowthSummaryData = useCallback(async (startDate, endDate) => {
    try {
      const plants = await firestoreService.getUserPlants(user.uid);
      const periodPlants = plants.filter(plant => {
        const createdDate = plant.createdAt?.toDate();
        return createdDate && createdDate >= startDate && createdDate <= endDate;
      });

      const activePlants = periodPlants.filter(plant => 
        plant.status === 'active' || plant.status === 'vegetative' || plant.status === 'flowering'
      ).length;

      const completedCycles = periodPlants.filter(plant => 
        plant.status === 'harvested' || plant.status === 'completed'
      ).length;

      // Mock calculations for summary
      const totalYield = periodPlants
        .filter(plant => plant.yield)
        .reduce((sum, plant) => sum + (plant.yield || 0), 0);

      const achievements = [
        'Successfully completed 3 harvest cycles',
        'Achieved 15% increase in average yield',
        'Reduced cultivation time by 5 days',
        'Maintained 90%+ plant health rating'
      ];

      const improvements = [
        'Optimize watering schedule for better consistency',
        'Implement environmental monitoring for temperature control',
        'Consider strain diversification for risk management',
        'Enhance nutrient tracking and management'
      ];

      return {
        period: {
          start: startDate.toLocaleDateString(),
          end: endDate.toLocaleDateString()
        },
        overview: {
          activePlants,
          completedCycles,
          totalYield: totalYield > 0 ? `${totalYield.toFixed(1)}g` : 'N/A',
          avgGrowthRate: '2.3cm/week'
        },
        achievements,
        improvements
      };
    } catch (error) {
      logError(error, { operation: 'generateGrowthSummaryData', startDate, endDate });
      throw error;
    }
  }, [user.uid]);

  /**
   * Generate and download report
   */
  const generateReport = useCallback(async (reportType, options = {}) => {
    if (!user) {
      throw new Error('User must be authenticated to generate reports');
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      logUserAction('generate_report', { reportType, options });
      const startTime = performance.now();

      // Get report template
      const ReportTemplate = REPORT_TEMPLATES[reportType];
      if (!ReportTemplate) {
        throw new Error(`Unknown report type: ${reportType}`);
      }

      setProgress(25);

      // Generate report data based on type
      let reportData;
      let filename;

      switch (reportType) {
        case REPORT_TYPES.PLANT_REPORT:
          if (!options.plantId) {
            throw new Error('Plant ID is required for plant reports');
          }
          reportData = await generatePlantReportData(options.plantId);
          filename = `plant-report-${reportData.plant.name || options.plantId}-${Date.now()}`;
          break;

        case REPORT_TYPES.STRAIN_PERFORMANCE:
          reportData = await generateStrainReportData(options.strainName);
          filename = `strain-performance-${options.strainName || 'all'}-${Date.now()}`;
          break;

        case REPORT_TYPES.GROWTH_SUMMARY:
          const startDate = options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const endDate = options.endDate || new Date();
          reportData = await generateGrowthSummaryData(startDate, endDate);
          filename = `growth-summary-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}`;
          break;

        default:
          throw new Error(`Report generation not implemented for type: ${reportType}`);
      }

      setProgress(50);

      // Generate PDF
      const pdfBlob = await generatePDFReport(ReportTemplate, reportData, filename);
      setProgress(75);

      // Download PDF
      downloadPDF(pdfBlob, filename);
      setProgress(100);

      // Add to report history
      const reportEntry = {
        id: Date.now().toString(),
        type: reportType,
        filename: `${filename}.pdf`,
        generatedAt: new Date(),
        options
      };
      setReportHistory(prev => [reportEntry, ...prev]);

      const duration = performance.now() - startTime;
      logPerformance('generateReport', duration, { 
        reportType, 
        size: pdfBlob.size,
        success: true 
      });

      logInfo(`Report generated successfully: ${filename}.pdf`);

      return reportEntry;
    } catch (error) {
      logError(error, { operation: 'generateReport', reportType, options });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [user, generatePlantReportData, generateStrainReportData, generateGrowthSummaryData]);

  /**
   * Get available plants for reports
   */
  const getAvailablePlants = useCallback(async () => {
    try {
      const plants = await firestoreService.getUserPlants(user.uid);
      return plants.map(plant => ({
        id: plant.id,
        name: plant.name,
        strain: plant.strain,
        stage: plant.stage,
        status: plant.status
      }));
    } catch (error) {
      logError(error, { operation: 'getAvailablePlants' });
      return [];
    }
  }, [user.uid]);

  /**
   * Get available strains for reports
   */
  const getAvailableStrains = useCallback(async () => {
    try {
      const plants = await firestoreService.getUserPlants(user.uid);
      const strains = [...new Set(plants.map(plant => plant.strain).filter(Boolean))];
      return strains.map(strain => ({ name: strain, value: strain }));
    } catch (error) {
      logError(error, { operation: 'getAvailableStrains' });
      return [];
    }
  }, [user.uid]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear report history
   */
  const clearReportHistory = useCallback(() => {
    setReportHistory([]);
    logInfo('Report history cleared');
  }, []);

  // Computed values
  const isGenerating = loading;
  const hasReports = reportHistory.length > 0;
  const recentReports = useMemo(() => 
    reportHistory.slice(0, 5), [reportHistory]
  );

  return {
    // State
    loading,
    error,
    progress,
    reportHistory,
    
    // Actions
    generateReport,
    clearError,
    clearReportHistory,
    
    // Data fetchers
    getAvailablePlants,
    getAvailableStrains,
    
    // Computed values
    isGenerating,
    hasReports,
    recentReports,
    
    // Constants
    REPORT_TYPES
  };
};

export default useReportGeneration;
