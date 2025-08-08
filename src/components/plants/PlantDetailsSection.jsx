import React from 'react';
import PropTypes from 'prop-types';

const PlantDetailsSection = ({ 
  formData, 
  onInputChange, 
  uidPreview, 
  strainWarning, 
  showStrainCodeField 
}) => {
  return (
    <div className="space-y-6">
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          className="input-field"
          placeholder="e.g., Blue Dream, OG Kush, White Widow"
          required
        />
      </div>

      {/* Strain Code - conditionally shown */}
      {showStrainCodeField && (
        <div>
          <label htmlFor="strainCode" className="block text-sm font-medium text-gray-700 mb-2">
            Strain Code *
          </label>
          <input
            type="text"
            id="strainCode"
            name="strainCode"
            value={formData.strainCode}
            onChange={onInputChange}
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
      )}

      {/* UID Preview */}
      {uidPreview && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm font-medium text-blue-800 mb-1">Plant UID Preview:</p>
          <p className="text-lg font-mono text-blue-900">{uidPreview}</p>
          <p className="text-xs text-blue-600 mt-1">
            This unique identifier will be assigned to your plant
          </p>
        </div>
      )}

      {/* Origin - Only Seeds allowed for new plants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Origin *
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="origin"
            value="Seed"
            checked={true}
            onChange={onInputChange}
            className="text-patriot-blue focus:ring-patriot-blue"
            disabled
          />
          <span className="text-sm">🌰 From Seed</span>
          <span className="text-xs text-gray-500 ml-2">
            (Clones are created from existing plants)
          </span>
        </div>
      </div>
    </div>
  );
};

PlantDetailsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  uidPreview: PropTypes.string,
  strainWarning: PropTypes.string,
  showStrainCodeField: PropTypes.bool
};

export default PlantDetailsSection;
