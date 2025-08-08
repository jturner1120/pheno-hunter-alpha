import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth';
import { updatePlant } from '../../../utils/firestore';

const HarvestModal = ({ plant, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    weight: '',
    quality: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.weight.trim()) {
        setError('Weight is required');
        setLoading(false);
        return;
      }

      // Create harvest record
      const newHarvest = {
        weight: formData.weight.trim(),
        quality: formData.quality.trim() || 'Not specified',
        notes: formData.notes.trim() || '',
        harvestDate: new Date()
      };

      // Update plant with harvest data and status
      const updatedPlant = {
        status: 'harvested',
        harvests: [...(plant.harvests || []), newHarvest]
      };

      // Update in Firestore
      await updatePlant(user.id, plant.id, updatedPlant);

      onSuccess({ ...plant, ...updatedPlant });
    } catch (err) {
      setError('Failed to record harvest');
    } finally {
      setLoading(false);
    }
  }, [formData, plant, user.id, onSuccess]);

  const handleClose = useCallback(() => {
    setFormData({
      weight: '',
      quality: '',
      notes: ''
    });
    setError('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-patriot-navy">Harvest Plant</h3>
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
                Weight * (e.g., "45g", "1.2 oz")
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter harvest weight"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality (e.g., "Excellent", "Good", "Average")
              </label>
              <input
                type="text"
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter quality assessment (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
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

HarvestModal.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    harvests: PropTypes.array
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default HarvestModal;
