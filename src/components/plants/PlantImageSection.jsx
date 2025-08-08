import React from 'react';
import PropTypes from 'prop-types';

const PlantImageSection = ({ 
  formData, 
  onImageChange, 
  onClearImage 
}) => {
  return (
    <div>
      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
        Plant Photo (Optional)
      </label>
      <div className="space-y-4">
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={onImageChange}
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
              onClick={onClearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Supported formats: JPG, PNG, GIF. Max size: 10MB
      </p>
    </div>
  );
};

PlantImageSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onImageChange: PropTypes.func.isRequired,
  onClearImage: PropTypes.func.isRequired
};

export default PlantImageSection;
