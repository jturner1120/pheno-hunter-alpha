import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loadDemoData, resetWithDemoData, clearAllData } from '../utils/demoData';
import { getPlantsData } from '../utils/localStorage';
import billyBong from '../assets/billy.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [plants, setPlants] = useState([]);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  useEffect(() => {
    setPlants(getPlantsData());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoadDemoData = () => {
    const demoPlants = loadDemoData();
    setPlants(demoPlants);
    setShowDemoOptions(false);
  };

  const handleResetWithDemo = () => {
    const demoPlants = resetWithDemoData();
    setPlants(demoPlants);
    setShowDemoOptions(false);
  };

  const handleClearData = () => {
    clearAllData();
    setPlants([]);
    setShowDemoOptions(false);
  };

  // Calculate stats
  const activePlants = plants.filter(plant => !plant.harvested).length;
  const clonesMade = plants.filter(plant => plant.origin === 'Clone').length;
  const harvestedPlants = plants.filter(plant => plant.harvested).length;

  return (
    <div className="min-h-screen bg-patriot-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-patriot-navy">Pheno Hunter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || user?.username}!</span>
              <button 
                onClick={handleLogout}
                className="btn-outline text-sm py-1 px-3"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-patriot-navy mb-4">
            Welcome to Your Plant Dashboard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your cannabis plants from seed to harvest. Monitor growth, clone your best performers, 
            and keep detailed records of your cultivation journey.
          </p>
        </div>

        {/* Billy Bong Mascot */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4">
            <img 
              src={billyBong} 
              alt="Billy Bong - Pheno Hunter mascot, a friendly cartoon character wearing a cap"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold text-patriot-navy mb-2">
            Meet Billy Bong!
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your friendly growing companion here to help you track your plants from seed to harvest.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div 
            className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/plant')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/plant')}
            tabIndex={0}
            role="button"
            aria-label="Add a new plant to your collection"
          >
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-patriot-red mb-2 group-hover:text-red-700">
              Add Plant
            </h3>
            <p className="text-gray-600">
              Register a new plant in your collection. Track from seed or clone.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center text-sm text-patriot-red group-hover:text-red-700">
                Get Started →
              </span>
            </div>
          </div>

          <div 
            className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/plants')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/plants')}
            tabIndex={0}
            role="button"
            aria-label="View your plant collection"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-patriot-blue mb-2 group-hover:text-blue-700">
              View Plants
            </h3>
            <p className="text-gray-600">
              Browse your collection, track progress, and manage your plants.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center text-sm text-patriot-blue group-hover:text-blue-700">
                View Collection →
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-patriot-navy">{activePlants}</div>
              <div className="text-sm text-gray-600">Active Plants</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-patriot-red">{clonesMade}</div>
              <div className="text-sm text-gray-600">Clones Made</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-patriot-blue">{harvestedPlants}</div>
              <div className="text-sm text-gray-600">Harvested</div>
            </div>
          </div>
        </div>

        {/* Demo Data Controls */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowDemoOptions(!showDemoOptions)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Demo Data Options
          </button>
          
          {showDemoOptions && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-4">
                Load sample plants to explore the app features
              </p>
              <div className="space-y-2">
                {plants.length === 0 ? (
                  <button
                    onClick={handleLoadDemoData}
                    className="btn-primary w-full text-sm"
                  >
                    Load Demo Data
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleResetWithDemo}
                      className="btn-outline w-full text-sm"
                    >
                      Replace with Demo Data
                    </button>
                    <button
                      onClick={handleClearData}
                      className="btn-outline text-red-600 border-red-600 hover:bg-red-50 w-full text-sm"
                    >
                      Clear All Data
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
