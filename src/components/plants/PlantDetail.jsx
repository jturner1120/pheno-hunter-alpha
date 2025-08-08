import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePlantDetail } from '../../hooks/usePlantDetail';
import PlantInfo from './PlantInfo';
import PlantDiary from './PlantDiary';
import PlantLifecycleTracker from './advanced/PlantLifecycleTracker';
import CloneModal from './modals/CloneModal';
import HarvestModal from './modals/HarvestModal';
import billyBong from '../../assets/billy.png';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Modal state
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Use custom hook for plant detail management
  const {
    plant,
    loading,
    error,
    editingDiary,
    diaryText,
    copyToast,
    copyUidToClipboard,
    handleDiarySave,
    handleDiaryCancel,
    startDiaryEdit,
    setDiaryTextValue,
    handleImageUpload,
    handlePlantUpdate,
    clearError
  } = usePlantDetail(id, user?.id);

  // Tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Modal handlers
  const handleCloneModalClose = useCallback(() => {
    setShowCloneModal(false);
  }, []);

  const handleCloneSuccess = useCallback((newPlant) => {
    setShowCloneModal(false);
    navigate(`/plants/${newPlant.id}`);
  }, [navigate]);

  const handleHarvestModalClose = useCallback(() => {
    setShowHarvestModal(false);
  }, []);

  const handleHarvestSuccess = useCallback((harvestedPlant) => {
    setShowHarvestModal(false);
    handlePlantUpdate(harvestedPlant);
  }, [handlePlantUpdate]);

  // Utility functions for date formatting
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getDaysOld = useCallback((timestamp) => {
    if (!timestamp) return 0;
    
    // Handle Firestore Timestamp
    const plantDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - plantDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-patriot-blue"></div>
            <span className="text-patriot-navy">Loading plant details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !plant) {
    return (
      <div className="min-h-screen bg-patriot-gray flex items-center justify-center">
        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src={billyBong} alt="Billy Bong" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-lg font-semibold text-patriot-navy mb-2">Plant Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/plants')}
            className="btn-primary"
          >
            Back to Plants
          </button>
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
                onClick={() => navigate('/plants')}
                className="text-patriot-blue hover:text-blue-700 mr-4"
              >
                ← Back to Plants
              </button>
              <h1 className="text-xl font-bold text-patriot-navy">{plant?.name}</h1>
            </div>
            <div className="flex space-x-2">
              {plant?.status !== 'harvested' && (
                <>
                  <button 
                    onClick={() => setShowCloneModal(true)}
                    className="btn-secondary text-sm"
                  >
                    🌿 Clone
                  </button>
                  <button 
                    onClick={() => setShowHarvestModal(true)}
                    className="btn-outline text-sm"
                  >
                    🌾 Harvest
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-700">{error}</p>
            {error !== 'Uploading image...' && (
              <button 
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Plant detail tabs">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'lifecycle', name: 'Lifecycle', icon: '🌱' },
                { id: 'diary', name: 'Diary', icon: '📝' },
                { id: 'metrics', name: 'Metrics', icon: '📈' },
                { id: 'photos', name: 'Photos', icon: '📸' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-patriot-blue text-patriot-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plant Info Component */}
              <PlantInfo
                plant={plant}
                copyToast={copyToast}
                onCopyUid={copyUidToClipboard}
                onImageUpload={handleImageUpload}
                isUploading={error === 'Uploading image...'}
                formatDate={formatDate}
                getDaysOld={getDaysOld}
              />

              {/* Plant Diary Component */}
              <PlantDiary
                plant={plant}
                editingDiary={editingDiary}
                diaryText={diaryText}
                onDiaryTextChange={setDiaryTextValue}
                onDiarySave={handleDiarySave}
                onDiaryCancel={handleDiaryCancel}
                onStartEdit={startDiaryEdit}
              />
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <PlantLifecycleTracker 
              plantId={id}
              className="space-y-6"
            />
          )}

          {activeTab === 'diary' && (
            <div className="max-w-4xl">
              <PlantDiary
                plant={plant}
                editingDiary={editingDiary}
                diaryText={diaryText}
                onDiaryTextChange={setDiaryTextValue}
                onDiarySave={handleDiarySave}
                onDiaryCancel={handleDiaryCancel}
                onStartEdit={startDiaryEdit}
                fullWidth={true}
              />
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
              <p className="text-gray-600">Growth metrics tracking coming soon...</p>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Timeline</h3>
              <p className="text-gray-600">Photo timeline feature coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* Clone Modal */}
      <CloneModal 
        plant={plant}
        isOpen={showCloneModal}
        onClose={handleCloneModalClose}
        onSuccess={handleCloneSuccess}
      />

      {/* Harvest Modal */}
      <HarvestModal 
        plant={plant}
        isOpen={showHarvestModal}
        onClose={handleHarvestModalClose}
        onSuccess={handleHarvestSuccess}
      />
    </div>
  );
};

export default PlantDetail;
