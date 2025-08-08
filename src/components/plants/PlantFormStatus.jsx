import React from 'react';
import PropTypes from 'prop-types';

const PlantFormStatus = ({ 
  error, 
  success, 
  loading, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <div className="space-y-4">
      {/* Planting Date Display */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          onClick={onSubmit}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Plant...' : 'Add Plant'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

PlantFormStatus.propTypes = {
  error: PropTypes.string,
  success: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default PlantFormStatus;
