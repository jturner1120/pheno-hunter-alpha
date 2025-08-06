import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlantsData, savePlantsData, convertImageToBase64, generatePlantId } from '../../utils/localStorage';
import billyBong from '../../assets/billy.png';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDiary, setEditingDiary] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  useEffect(() => {
    loadPlant();
  }, [id]);

  const loadPlant = () => {
    try {
      const plants = getPlantsData();
      const foundPlant = plants.find(p => p.id === id);
      
      if (!foundPlant) {
        setError('Plant not found');
        setLoading(false);
        return;
      }
      
      setPlant(foundPlant);
      setDiaryText(foundPlant.diary || '');
    } catch (err) {
      setError('Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  const updatePlant = (updatedPlant) => {
    try {
      const plants = getPlantsData();
      const updatedPlants = plants.map(p => p.id === id ? updatedPlant : p);
      savePlantsData(updatedPlants);
      setPlant(updatedPlant);
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const handleDiarySave = () => {
    const updatedPlant = { ...plant, diary: diaryText };
    updatePlant(updatedPlant);
    setEditingDiary(false);
  };

  const handleDiaryCancel = () => {
    setDiaryText(plant.diary || '');
    setEditingDiary(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      const updatedPlant = { ...plant, image: base64 };
      updatePlant(updatedPlant);
      setError('');
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysOld = (dateString) => {
    const plantDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - plantDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
              {!plant?.harvested && (
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
      <main className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Info Card */}
          <div className="card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-patriot-navy mb-2">{plant?.name}</h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {plant?.harvested ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    🌾 Harvested
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    🌱 Active ({getDaysOld(plant?.datePlanted)} days old)
                  </span>
                )}
              </div>
            </div>

            {/* Plant Image */}
            <div className="mb-6">
              <div className="relative">
                {plant?.image ? (
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">🌱</div>
                      <p className="text-gray-500 text-sm">No photo yet</p>
                    </div>
                  </div>
                )}
                
                {!plant?.harvested && (
                  <div className="absolute bottom-2 right-2">
                    <label className="bg-patriot-blue text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Plant Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Strain:</span>
                  <p className="text-gray-900">{plant?.strain}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Origin:</span>
                  <p className="text-gray-900">
                    {plant?.origin === 'Seed' ? '🌰' : '🌿'} {plant?.origin}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date Planted:</span>
                  <p className="text-gray-900">{formatDate(plant?.datePlanted)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Generation:</span>
                  <p className="text-gray-900">Gen {plant?.generation}</p>
                </div>
                {plant?.originalMotherId && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Mother Plant ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{plant.originalMotherId}</p>
                  </div>
                )}
              </div>

              {/* Harvest Stats */}
              {plant?.harvested && plant?.harvestStats && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Harvest Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Weight:</span>
                      <p className="text-gray-900">{plant.harvestStats.weight}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Potency:</span>
                      <p className="text-gray-900">{plant.harvestStats.potency}</p>
                    </div>
                    {plant.harvestStats.notes && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Notes:</span>
                        <p className="text-gray-900">{plant.harvestStats.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grow Diary Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-patriot-navy">Grow Diary</h3>
              {!plant?.harvested && !editingDiary && (
                <button 
                  onClick={() => setEditingDiary(true)}
                  className="text-patriot-blue hover:text-blue-700 text-sm"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {editingDiary ? (
              <div className="space-y-4">
                <textarea
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder="Record your observations, feeding schedule, growth milestones, and any notes about this plant..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-patriot-blue"
                />
                <div className="flex space-x-2">
                  <button onClick={handleDiarySave} className="btn-primary text-sm">
                    Save
                  </button>
                  <button onClick={handleDiaryCancel} className="btn-outline text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[10rem]">
                {plant?.diary ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {plant.diary}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3">
                      <img src={billyBong} alt="Billy Bong" className="w-full h-full object-contain opacity-50" />
                    </div>
                    <p className="text-sm">No diary entries yet.</p>
                    <p className="text-xs">Billy suggests starting with your planting notes!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clone Modal */}
      {showCloneModal && (
        <CloneModal 
          plant={plant}
          onClose={() => setShowCloneModal(false)}
          onSuccess={(newPlant) => {
            setShowCloneModal(false);
            navigate(`/plants/${newPlant.id}`);
          }}
        />
      )}

      {/* Harvest Modal */}
      {showHarvestModal && (
        <HarvestModal 
          plant={plant}
          onClose={() => setShowHarvestModal(false)}
          onSuccess={(harvestedPlant) => {
            setShowHarvestModal(false);
            setPlant(harvestedPlant);
          }}
        />
      )}
    </div>
  );
};

// Clone Modal Component
const CloneModal = ({ plant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: `${plant.name} Clone`,
    image: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setFormData(prev => ({ ...prev, image: base64, imagePreview: base64 }));
      setError('');
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError('Clone name is required');
        setLoading(false);
        return;
      }

      if (!formData.image) {
        setError('Please add a photo of the clone');
        setLoading(false);
        return;
      }

      // Create clone plant
      const newClone = {
        id: generatePlantId(),
        name: formData.name.trim(),
        strain: plant.strain,
        origin: 'Clone',
        datePlanted: new Date().toISOString(),
        image: formData.image,
        diary: `Cloned from ${plant.name} on ${new Date().toLocaleDateString()}`,
        generation: plant.generation + 1,
        originalMotherId: plant.originalMotherId || plant.id,
        harvested: false,
        harvestStats: null,
        createdBy: plant.createdBy,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const plants = getPlantsData();
      const updatedPlants = [...plants, newClone];
      savePlantsData(updatedPlants);

      onSuccess(newClone);
    } catch (err) {
      setError('Failed to create clone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-patriot-navy">Clone Plant</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clone Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="Give your clone a unique name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clone Photo * (Required for new clone)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-patriot-blue file:text-white hover:file:bg-blue-700"
                required
              />
              {formData.imagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.imagePreview}
                    alt="Clone preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Clone Info:</strong> This will inherit the strain "{plant.strain}" and be marked as Generation {plant.generation + 1}.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Creating Clone...' : 'Create Clone'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Harvest Modal Component
const HarvestModal = ({ plant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    weight: '',
    potency: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.weight.trim()) {
        setError('Weight is required');
        setLoading(false);
        return;
      }

      // Update plant with harvest data
      const harvestedPlant = {
        ...plant,
        harvested: true,
        harvestStats: {
          weight: formData.weight.trim(),
          potency: formData.potency.trim() || 'Not specified',
          notes: formData.notes.trim() || '',
          harvestDate: new Date().toISOString()
        }
      };

      // Save to localStorage
      const plants = getPlantsData();
      const updatedPlants = plants.map(p => p.id === plant.id ? harvestedPlant : p);
      savePlantsData(updatedPlants);

      onSuccess(harvestedPlant);
    } catch (err) {
      setError('Failed to record harvest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-patriot-navy">Harvest Plant</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight * (e.g., "45g", "1.2 oz")
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="input-field"
                placeholder="Enter harvest weight"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potency (e.g., "18% THC", "High CBD")
              </label>
              <input
                type="text"
                value={formData.potency}
                onChange={(e) => setFormData(prev => ({ ...prev, potency: e.target.value }))}
                className="input-field"
                placeholder="Enter potency info (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field resize-none"
                rows="3"
                placeholder="Quality, aroma, appearance, curing notes..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will mark "{plant.name}" as harvested and prevent further diary entries or cloning.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Recording Harvest...' : 'Record Harvest'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
