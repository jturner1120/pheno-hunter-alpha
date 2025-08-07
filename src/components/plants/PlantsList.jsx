import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserPlants, getPlantStats } from '../../utils/firestore';
import billyBong from '../../assets/billy.png';

const PlantsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadPlants();
    }
  }, [user]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [plantsData, statsData] = await Promise.all([
        getUserPlants(user.id),
        getPlantStats(user.id)
      ]);
      
      setPlants(plantsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading plants:', error);
      setError('Failed to load plants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'N/A';
    
    // Handle Firestore timestamp
    let date;
    if (dateField.toDate) {
      date = dateField.toDate();
    } else if (typeof dateField === 'string') {
      date = new Date(dateField);
    } else {
      date = dateField;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (plant) => {
    const status = plant.status || (plant.harvested ? 'harvested' : 'active');
    
    const statusConfig = {
      seedling: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Seedling' },
      vegetative: { bg: 'bg-green-100', text: 'text-green-800', label: 'Vegetative' },
      flowering: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Flowering' },
      harvested: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Harvested' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleView = (plantId) => {
    navigate(`/plants/${plantId}`);
  };

  const handleClone = (plant) => {
    navigate(`/plants/${plant.id}`);
  };

  const handleHarvest = (plant) => {
    navigate(`/plants/${plant.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-patriot-blue"></div>
            <span className="text-patriot-navy">Loading plants...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Plants</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadPlants}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-patriot-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-patriot-blue hover:text-blue-700 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-patriot-navy">Your Plants</h1>
            </div>
            <button 
              onClick={() => navigate('/plant')}
              className="btn-primary"
            >
              + Add Plant
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {plants.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6">
              <img 
                src={billyBong} 
                alt="Billy Bong" 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold text-patriot-navy mb-2">
              No plants yet!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Billy's excited to help you start your growing journey! Add your first plant to get started.
            </p>
            <button 
              onClick={() => navigate('/plant')}
              className="btn-primary"
            >
              Add Your First Plant
            </button>
          </div>
        ) : (
          // Plants Table/Cards
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-patriot-navy">{stats.totalPlants || plants.length}</div>
                <div className="text-sm text-gray-600">Total Plants</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {stats.activePlants || plants.filter(p => p.status !== 'harvested' && !p.harvested).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.harvestedPlants || plants.filter(p => p.status === 'harvested' || p.harvested).length}
                </div>
                <div className="text-sm text-gray-600">Harvested</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-patriot-blue">
                  {stats.totalClones || plants.filter(p => p.isClone || p.origin === 'Clone').length}
                </div>
                <div className="text-sm text-gray-600">Clones</div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plants.map((plant) => (
                      <tr key={plant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {(plant.imageUrl || plant.image) ? (
                              <img
                                src={plant.imageUrl || plant.image}
                                alt={plant.name}
                                className="h-10 w-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-gray-500 text-sm">🌱</span>
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {plant.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plant.strain}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plant.uid ? (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {plant.uid}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No UID</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plant.origin || (plant.isClone ? 'Clone' : 'Seed') === 'Seed' ? '🌰' : '🌿'} {plant.origin || (plant.isClone ? 'Clone' : 'Seed')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(plant.plantedDate || plant.datePlanted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Gen {(plant.cloneGeneration || 0) + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(plant)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleView(plant.id)}
                            className="text-patriot-blue hover:text-blue-700"
                          >
                            View
                          </button>
                          {!plant.harvested && plant.status !== 'harvested' && (
                            <>
                              <button
                                onClick={() => handleClone(plant)}
                                className="text-patriot-red hover:text-red-700"
                              >
                                Clone
                              </button>
                              <button
                                onClick={() => handleHarvest(plant)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Harvest
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {plants.map((plant) => (
                <div key={plant.id} className="card">
                  <div className="flex items-start space-x-4">
                    {(plant.imageUrl || plant.image) ? (
                      <img
                        src={plant.imageUrl || plant.image}
                        alt={plant.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">🌱</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {plant.name}
                        </h3>
                        {getStatusBadge(plant)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Strain:</span> {plant.strain}</p>
                        {plant.uid && (
                          <p><span className="font-medium">UID:</span> <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{plant.uid}</span></p>
                        )}
                        <p><span className="font-medium">Origin:</span> {plant.origin || (plant.isClone ? 'Clone' : 'Seed') === 'Seed' ? '🌰' : '🌿'} {plant.origin || (plant.isClone ? 'Clone' : 'Seed')}</p>
                        <p><span className="font-medium">Planted:</span> {formatDate(plant.plantedDate || plant.datePlanted)}</p>
                        <p><span className="font-medium">Generation:</span> {(plant.cloneGeneration || 0) + 1}</p>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => handleView(plant.id)}
                          className="text-patriot-blue hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                        {!plant.harvested && plant.status !== 'harvested' && (
                          <>
                            <button
                              onClick={() => handleClone(plant)}
                              className="text-patriot-red hover:text-red-700 text-sm font-medium"
                            >
                              Clone
                            </button>
                            <button
                              onClick={() => handleHarvest(plant)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Harvest
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlantsList;
