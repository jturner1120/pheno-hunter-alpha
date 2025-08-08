import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth';
import { createPlant, updatePlant } from '../../../utils/firestore';
import { uploadPlantImageSmart } from '../../../utils/imageUtils';
import { generateCloneUID } from '../../../utils/uidGeneration';

const CloneModal = ({ plant, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: `${plant.name} Clone`,
    imageFile: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    setError('Processing image...');
    
    try {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageFile: file, imagePreview: previewUrl }));
      setError('');
    } catch (err) {
      console.error('Clone image processing error:', err);
      setError('Failed to process image. Please try a different image.');
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError('Clone name is required');
        setLoading(false);
        return;
      }

      if (!formData.imageFile) {
        setError('Please add a photo of the clone');
        setLoading(false);
        return;
      }

      // Generate UID for the clone
      let cloneUID;
      try {
        if (plant.uid) {
          const uidResult = await generateCloneUID(user.id, plant.uid, plant.id);
          cloneUID = uidResult.uid;
        }
      } catch (uidError) {
        console.warn('Failed to generate clone UID:', uidError);
        // Continue without UID rather than failing the clone creation
      }

      // Create clone plant data
      const newClone = {
        uid: cloneUID,
        name: formData.name.trim(),
        strain: plant.strain,
        strainCode: plant.strainCode,
        origin: 'Clone',
        isClone: true,
        cloneGeneration: (plant.cloneGeneration || 0) + 1,
        parentPlantId: plant.id,
        diary: `Cloned from ${plant.name} on ${new Date().toLocaleDateString()}`,
        status: 'seedling',
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

      // Save clone to Firestore first
      const plantId = await createPlant(user.id, newClone);

      // Upload clone image
      let imageUrl = null;
      if (formData.imageFile) {
        try {
          imageUrl = await uploadPlantImageSmart(formData.imageFile, user.id, plantId, 'clone');
          await updatePlant(user.id, plantId, { imageUrl });
        } catch (imageError) {
          console.warn('Clone image upload failed:', imageError);
        }
      }

      onSuccess({ id: plantId, ...newClone, imageUrl });
    } catch (err) {
      setError('Failed to create clone');
    } finally {
      setLoading(false);
    }
  }, [formData, plant, user.id, onSuccess]);

  const handleClose = useCallback(() => {
    setFormData({
      name: `${plant.name} Clone`,
      imageFile: null,
      imagePreview: null
    });
    setError('');
    onClose();
  }, [plant.name, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-patriot-navy">Clone Plant</h3>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
                <strong>Clone Info:</strong> This will inherit the strain "{plant.strain}" and be marked as Generation {(plant.cloneGeneration || 0) + 1}.
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
                onClick={handleClose}
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

CloneModal.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    strain: PropTypes.string.isRequired,
    strainCode: PropTypes.string,
    uid: PropTypes.string,
    cloneGeneration: PropTypes.number
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default CloneModal;
