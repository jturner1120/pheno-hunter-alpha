// src/components/reports/ReportGenerator.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useReportGeneration } from '../../hooks/useReportGeneration';
import ErrorBoundary from '../ErrorBoundary';

const ReportGenerator = () => {
  const {
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
  } = useReportGeneration();

  // Local state
  const [selectedReportType, setSelectedReportType] = useState(REPORT_TYPES.PLANT_REPORT);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedStrain, setSelectedStrain] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [availablePlants, setAvailablePlants] = useState([]);
  const [availableStrains, setAvailableStrains] = useState([]);

  // Load available data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [plants, strains] = await Promise.all([
          getAvailablePlants(),
          getAvailableStrains()
        ]);
        setAvailablePlants(plants);
        setAvailableStrains(strains);
      } catch (error) {
        console.error('Failed to load report data:', error);
      }
    };

    loadData();
  }, [getAvailablePlants, getAvailableStrains]);

  // Handle report generation
  const handleGenerateReport = async () => {
    try {
      const options = {};

      switch (selectedReportType) {
        case REPORT_TYPES.PLANT_REPORT:
          if (!selectedPlant) {
            alert('Please select a plant for the report');
            return;
          }
          options.plantId = selectedPlant;
          break;

        case REPORT_TYPES.STRAIN_PERFORMANCE:
          if (selectedStrain) {
            options.strainName = selectedStrain;
          }
          break;

        case REPORT_TYPES.GROWTH_SUMMARY:
          options.startDate = new Date(dateRange.start);
          options.endDate = new Date(dateRange.end);
          break;

        default:
          alert('Please select a valid report type');
          return;
      }

      await generateReport(selectedReportType, options);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  // Report type options
  const reportTypeOptions = [
    { value: REPORT_TYPES.PLANT_REPORT, label: 'Individual Plant Report' },
    { value: REPORT_TYPES.STRAIN_PERFORMANCE, label: 'Strain Performance Analysis' },
    { value: REPORT_TYPES.GROWTH_SUMMARY, label: 'Growth Summary Report' }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-patriot-gray">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Report Generator</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Generate comprehensive PDF reports for your cultivation data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Configuration */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Configure Report</h2>
                  <p className="text-sm text-gray-600">
                    Select report type and configure options
                  </p>
                </div>

                <div className="card-content space-y-6">
                  {/* Report Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select
                      value={selectedReportType}
                      onChange={(e) => setSelectedReportType(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                    >
                      {reportTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plant Selection (for Plant Report) */}
                  {selectedReportType === REPORT_TYPES.PLANT_REPORT && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Plant
                      </label>
                      <select
                        value={selectedPlant}
                        onChange={(e) => setSelectedPlant(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                      >
                        <option value="">Choose a plant...</option>
                        {availablePlants.map(plant => (
                          <option key={plant.id} value={plant.id}>
                            {plant.name} ({plant.strain}) - {plant.stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Strain Selection (for Strain Performance) */}
                  {selectedReportType === REPORT_TYPES.STRAIN_PERFORMANCE && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Strain (Optional)
                      </label>
                      <select
                        value={selectedStrain}
                        onChange={(e) => setSelectedStrain(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                      >
                        <option value="">All Strains</option>
                        {availableStrains.map(strain => (
                          <option key={strain.value} value={strain.value}>
                            {strain.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date Range (for Growth Summary) */}
                  {selectedReportType === REPORT_TYPES.GROWTH_SUMMARY && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-patriot-blue focus:ring-patriot-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Report Generation Error</h3>
                          <p className="mt-1 text-sm text-red-700">{error}</p>
                          <button
                            onClick={clearError}
                            className="mt-2 text-sm text-red-800 underline hover:text-red-600"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isGenerating && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Generating report...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-patriot-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      isGenerating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-patriot-blue text-white hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>

            {/* Report History */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                    {hasReports && (
                      <button
                        onClick={clearReportHistory}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-content">
                  {!hasReports ? (
                    <p className="text-gray-500 text-center py-8">
                      No reports generated yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentReports.map(report => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {report.filename}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {report.generatedAt.toLocaleDateString()} at {' '}
                                {report.generatedAt.toLocaleTimeString()}
                              </p>
                              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                {report.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Report Type Info */}
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Report Types</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900">Plant Report</h4>
                      <p className="text-gray-600">Detailed analysis of a single plant including growth metrics, timeline, and notes.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Strain Performance</h4>
                      <p className="text-gray-600">Comparative analysis of strain performance including success rates and yields.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Growth Summary</h4>
                      <p className="text-gray-600">Overview of cultivation activities and achievements over a specified period.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

ReportGenerator.propTypes = {};

export default ReportGenerator;
