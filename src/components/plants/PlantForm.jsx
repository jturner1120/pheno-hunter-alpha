import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createPlant } from '../../utils/firestore';
import { uploadPlantImageSmart } from '../../utils/imageUtils';
import { getOrCreateStrainCode, getAllUserStrainCodes, validateStrainCode, normalizeStrainCode } from '../../utils/strainValidation';
import { generateSeedUID, formatDateForUID } from '../../utils/uidGeneration';
import billyBong from '../../assets/billy.png';

const PlantForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    strain: '',
    strainCode: '', // New field for strain code
    origin: 'Seed', // Seed or Clone
    imageFile: null, // Store the actual file
    imagePreview: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uidPreview, setUidPreview] = useState('');
  const [strainWarning, setStrainWarning] = useState('');
  const [existingStrains, setExistingStrains] = useState([]);
  const [showStrainCodeField, setShowStrainCodeField] = useState(false);

  // Load existing strains on component mount
  useEffect(() => {
    const loadExistingStrains = async () => {
      if (user?.id) {
        try {
          const strains = await getAllUserStrainCodes(user.id);
          setExistingStrains(strains);
        } catch (error) {
          console.error('Error loading existing strains:', error);
        }
      }
    };
    loadExistingStrains();
  }, [user?.id]);

  // Generate UID preview when form data changes
  useEffect(() => {
    const generatePreview = async () => {
      if (formData.strain.trim() && formData.name.trim()) {
        try {
          // Check if strain exists
          const existingStrain = existingStrains.find(s => 
            s.strainName.toLowerCase() === formData.strain.toLowerCase()
          );
          
          if (existingStrain) {
            // Use existing strain code
            const dateBornStr = formatDateForUID(new Date());
            setUidPreview(`${existingStrain.strainCode}_${dateBornStr}_XX`);
            setShowStrainCodeField(false);
            setStrainWarning('');
          } else {
            // New strain - show strain code field
            setShowStrainCodeField(true);
            if (formData.strainCode.trim()) {
              const normalizedCode = normalizeStrainCode(formData.strainCode);
              const validation = validateStrainCode(normalizedCode);
              if (validation.valid) {
                const dateBornStr = formatDateForUID(new Date());
                setUidPreview(`${normalizedCode}_${dateBornStr}_XX`);
              } else {
                setUidPreview('Invalid strain code');
              }
            } else {
              setUidPreview('Enter strain code to preview UID');
            }
          }
        } catch (error) {
          console.error('Error generating UID preview:', error);
          setUidPreview('Error generating preview');
        }
      } else {
        setUidPreview('');
        setShowStrainCodeField(false);
      }
    };

    generatePreview();
  }, [formData.strain, formData.strainCode, formData.name, existingStrains]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for strain code (force uppercase)
    if (name === 'strainCode') {
      const normalizedValue = normalizeStrainCode(value);
      setFormData(prev => ({
        ...prev,
        [name]: normalizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
    if (strainWarning) setStrainWarning('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl
      }));
      setError('');
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try a different image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Plant name is required');
        setLoading(false);
        return;
      }

      if (!formData.strain.trim()) {
        setError('Strain is required');
        setLoading(false);
        return;
      }

      if (!formData.strainCode.trim()) {
        setError('Strain code is required');
        setLoading(false);
        return;
      }

      // Validate strain code
      const strainValidation = validateStrainCode(formData.strainCode);
      if (!strainValidation.isValid) {
        setError(`Invalid strain code: ${strainValidation.message}`);
        setLoading(false);
        return;
      }

      // Generate UID for the plant
      let plantUID;
      try {
        const isClone = formData.origin === 'Clone';
        plantUID = await generateUID(user.id, formData.strainCode, isClone);
      } catch (uidError) {
        setError(`Failed to generate plant UID: ${uidError.message}`);
        setLoading(false);
        return;
      }

      // Create new plant object for Firestore (without image first)
      const newPlant = {
        uid: plantUID, // Add the generated UID
        name: formData.name.trim(),
        strain: formData.strain.trim(),
        strainCode: formData.strainCode.trim(),
        origin: formData.origin,
        status: 'seedling',
        isClone: formData.origin === 'Clone',
        cloneGeneration: formData.origin === 'Clone' ? 1 : 0,
        diary: '',
        environment: {
          lights: '',
          temperature: '',
          humidity: '',
          medium: ''
        },
        nutrients: {
          schedule: '',
          brand: '',
          notes: ''
        },
        genetics: {
          breeder: '',
          type: '',
          thc: null,
          cbd: null
        },
        harvests: []
      };

      // Save plant to Firestore first to get an ID
      const plantId = await createPlant(user.id, newPlant);

      // Upload image if provided
      let imageUrl = null;
      if (formData.imageFile) {
        setError('Uploading image...');
        try {
          imageUrl = await uploadPlantImageSmart(formData.imageFile, user.id, plantId, 'main');
          
          // Update plant with image URL
          const { updatePlant } = await import('../../utils/firestore');
          await updatePlant(user.id, plantId, { imageUrl });
        } catch (imageError) {
          console.warn('Image upload failed, but plant was created:', imageError);
          // Don't fail the whole operation if image upload fails
        }
      }

      setSuccess('Plant added successfully!');
      setError('');
      
      // Redirect to plants list after short delay
      setTimeout(() => {
        navigate('/plants');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to save plant. Please try again.');
      console.error('Error saving plant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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
              <h1 className="text-xl font-bold text-patriot-navy">Add New Plant</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="card">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16">
                <img 
                  src={billyBong} 
                  alt="Billy Bong" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-4xl">🌱</div>
            </div>
            <h2 className="text-2xl font-bold text-patriot-navy mb-2">
              Register New Plant
            </h2>
            <p className="text-gray-600">
              Billy's here to help you add a new plant to your collection!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plant Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Give your plant a unique name"
                required
              />
            </div>

            {/* Strain */}
            <div>
              <label htmlFor="strain" className="block text-sm font-medium text-gray-700 mb-2">
                Strain *
              </label>
              <input
                type="text"
                id="strain"
                name="strain"
                value={formData.strain}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Blue Dream, OG Kush, White Widow"
                required
              />
            </div>

            {/* Strain Code */}
            <div>
              <label htmlFor="strainCode" className="block text-sm font-medium text-gray-700 mb-2">
                Strain Code *
              </label>
              <input
                type="text"
                id="strainCode"
                name="strainCode"
                value={formData.strainCode}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., OGK, WWA (auto-generated if empty)"
                maxLength={10}
                required
              />
              {strainWarning && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ {strainWarning}
                </p>
              )}
            </div>

            {/* UID Preview */}
            {formData.strainCode && uidPreview && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm font-medium text-blue-800 mb-1">Plant UID Preview:</p>
                <p className="text-lg font-mono text-blue-900">{uidPreview}</p>
                <p className="text-xs text-blue-600 mt-1">This unique identifier will be assigned to your plant</p>
              </div>
            )}

            {/* Origin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="origin"
                    value="Seed"
                    checked={formData.origin === 'Seed'}
                    onChange={handleInputChange}
                    className="text-patriot-blue focus:ring-patriot-blue"
                  />
                  <span className="text-sm">🌰 From Seed</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="origin"
                    value="Clone"
                    checked={formData.origin === 'Clone'}
                    onChange={handleInputChange}
                    className="text-patriot-blue focus:ring-patriot-blue"
                  />
                  <span className="text-sm">🌿 From Clone</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Plant Photo (Optional)
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-patriot-blue file:text-white hover:file:bg-blue-700"
                />
                {formData.imagePreview && (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Plant preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            {/* Auto-generated Date Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planting Date
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving Plant...' : 'Add Plant'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-outline flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PlantForm;
