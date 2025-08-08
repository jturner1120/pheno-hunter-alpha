import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboard from '../hooks/useDashboard';
import ErrorBoundary from './ErrorBoundary';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardWelcome from './dashboard/DashboardWelcome';
import DashboardNavigation from './dashboard/DashboardNavigation';
import DashboardStats from './dashboard/DashboardStats';
import RecentPlantsWidget from './dashboard/RecentPlantsWidget';
import { DashboardLoadingState, DashboardErrorState } from './dashboard/DashboardStates';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const {
    // State
    stats,
    loading,
    error,
    recentPlants,
    
    // User info
    user,
    
    // Actions
    retryLoadData,
    clearError,
    
    // Navigation
    handleNavigateToPlants,
    handleNavigateToAddPlant,
    handleNavigateToPlantDetail,
    handleLogout,
    
    // Computed values
    hasPlants,
    isFirstTime,
  } = useDashboard();

  // Enhanced stats click handler for filtering
  const handleStatsClick = (statType) => {
    navigate(`/plants?filter=${statType}`);
  };

  const handleNavigateToAnalytics = () => {
    navigate('/analytics');
  };

  const handleNavigateToReports = () => {
    navigate('/reports');
  };

  const handleNavigateToPredictions = () => {
    navigate('/predictions');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return <DashboardLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <DashboardErrorState 
        error={error}
        onRetry={retryLoadData}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  // Main dashboard render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-patriot-gray">
        <DashboardHeader 
          user={user} 
          onLogout={handleLogout} 
        />

        <main className="max-w-4xl mx-auto p-6">
          <DashboardWelcome isFirstTime={isFirstTime} />

          <DashboardNavigation 
            onNavigateToAddPlant={handleNavigateToAddPlant}
            onNavigateToPlants={handleNavigateToPlants}
            onNavigateToAnalytics={handleNavigateToAnalytics}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToPredictions={handleNavigateToPredictions}
            hasPlants={hasPlants}
          />

          <DashboardStats 
            stats={stats}
            loading={loading}
            onStatsClick={handleStatsClick}
            hasPlants={hasPlants}
          />

          <RecentPlantsWidget 
            recentPlants={recentPlants}
            onViewPlant={handleNavigateToPlantDetail}
            onViewAllPlants={handleNavigateToPlants}
            loading={loading}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
