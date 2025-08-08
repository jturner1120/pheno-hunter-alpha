// src/components/insights/InsightsDashboard.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import TrendAnalysis from './TrendAnalysis';
import PerformanceComparison from './PerformanceComparison';
import OptimizationSuggestions from './OptimizationSuggestions';
import EnvironmentalCorrelations from './EnvironmentalCorrelations';
import { useAuth } from '../../hooks/useAuth';

const InsightsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    trends: {},
    comparisons: {},
    suggestions: [],
    correlations: {}
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [error, setError] = useState(null);

  // Load insights data
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulated insights data - replace with actual API calls
        const mockInsights = {
          trends: {
            growth_rate: {
              data: [
                { date: '2024-01-01', value: 2.1 },
                { date: '2024-01-08', value: 2.3 },
                { date: '2024-01-15', value: 2.5 },
                { date: '2024-01-22', value: 2.2 },
                { date: '2024-01-29', value: 2.7 }
              ],
              trend: 'increasing',
              percentage_change: 12.5
            },
            environmental_stability: {
              data: [
                { date: '2024-01-01', temperature: 24.2, humidity: 65, light_hours: 18 },
                { date: '2024-01-08', temperature: 24.5, humidity: 62, light_hours: 18 },
                { date: '2024-01-15', temperature: 23.8, humidity: 68, light_hours: 18 },
                { date: '2024-01-22', temperature: 24.1, humidity: 64, light_hours: 18 },
                { date: '2024-01-29', temperature: 24.3, humidity: 66, light_hours: 18 }
              ],
              stability_score: 0.87
            },
            harvest_timing: {
              average_days_to_harvest: 78,
              variability: 5.2,
              success_rate: 0.94
            }
          },
          comparisons: {
            strain_performance: [
              { strain: 'OG Kush', avg_yield: 450, avg_growth_rate: 2.4, harvest_success: 0.95 },
              { strain: 'Blue Dream', avg_yield: 520, avg_growth_rate: 2.6, harvest_success: 0.92 },
              { strain: 'White Widow', avg_yield: 380, avg_growth_rate: 2.1, harvest_success: 0.97 }
            ],
            environmental_impact: {
              optimal_temperature: { min: 23, max: 25, current_avg: 24.2 },
              optimal_humidity: { min: 60, max: 70, current_avg: 65 },
              light_efficiency: 0.85
            }
          },
          suggestions: [
            {
              type: 'environmental',
              priority: 'high',
              title: 'Optimize Temperature Range',
              description: 'Your average temperature of 24.2°C is optimal. Maintaining consistency will improve yields by an estimated 8%.',
              impact: 'yield_increase',
              estimated_benefit: '8% yield increase',
              actionable_steps: [
                'Install temperature monitoring system',
                'Set up automated climate control',
                'Review insulation and ventilation'
              ]
            },
            {
              type: 'strain',
              priority: 'medium',
              title: 'Consider High-Yield Strains',
              description: 'Based on your setup, Blue Dream shows 15% higher yield potential compared to current selections.',
              impact: 'yield_optimization',
              estimated_benefit: '15% higher yield',
              actionable_steps: [
                'Research Blue Dream growing requirements',
                'Plan next growing cycle with selected strain',
                'Adjust nutrients for strain-specific needs'
              ]
            },
            {
              type: 'timing',
              priority: 'low',
              title: 'Harvest Window Optimization',
              description: 'Your harvest timing accuracy is excellent at 94%. Fine-tuning could reach 98%.',
              impact: 'quality_improvement',
              estimated_benefit: '4% quality improvement',
              actionable_steps: [
                'Use trichome microscopy for precise timing',
                'Track terpene development patterns',
                'Document optimal harvest indicators'
              ]
            }
          ],
          correlations: {
            growth_vs_environment: {
              temperature_correlation: 0.73,
              humidity_correlation: -0.45,
              light_correlation: 0.89
            },
            yield_factors: {
              vegetative_duration: 0.62,
              flowering_duration: 0.78,
              environmental_stability: 0.84
            }
          }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setInsights(mockInsights);
      } catch (err) {
        console.error('Error loading insights:', err);
        setError('Failed to load insights data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [selectedTimeRange, selectedPlants]);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Insights</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Insights</h1>
                <p className="text-gray-600 mt-1">
                  Deep analytics and optimization recommendations for your cultivation
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
                {/* Time Range Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Time Range:</label>
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Export Button */}
                <button className="btn btn-outline text-sm">
                  Export Insights
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loading Skeletons */}
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Optimization Suggestions - Featured at top */}
              <OptimizationSuggestions 
                suggestions={insights.suggestions}
                timeRange={selectedTimeRange}
              />

              {/* Main insights grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Analysis */}
                <TrendAnalysis 
                  trends={insights.trends}
                  timeRange={selectedTimeRange}
                />

                {/* Performance Comparison */}
                <PerformanceComparison 
                  comparisons={insights.comparisons}
                  timeRange={selectedTimeRange}
                />

                {/* Environmental Correlations */}
                <div className="lg:col-span-2">
                  <EnvironmentalCorrelations 
                    correlations={insights.correlations}
                    timeRange={selectedTimeRange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default InsightsDashboard;
