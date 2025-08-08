// src/components/plants/bulk/BulkEditModal.jsx
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useMultiSelect } from './MultiSelectProvider';

const InputField = ({ type, value, onChange, placeholder, options = [], error }) => {
  switch (type) {
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select an option...</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      );

    case 'metrics':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={value.height || ''}
                onChange={(e) => onChange({ ...value, height: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={value.width || ''}
                onChange={(e) => onChange({ ...value, width: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Count
              </label>
              <input
                type="number"
                value={value.nodeCount || ''}
                onChange={(e) => onChange({ ...value, nodeCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Count
              </label>
              <input
                type="number"
                value={value.branchCount || ''}
                onChange={(e) => onChange({ ...value, branchCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>
      );

    case 'clone_config':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of clones per plant
            </label>
            <select
              value={value.cloneCount || 1}
              onChange={(e) => onChange({ ...value, cloneCount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clone naming pattern
            </label>
            <input
              type="text"
              value={value.namingPattern || '{parent} Clone {number}'}
              onChange={(e) => onChange({ ...value, namingPattern: e.target.value })}
              placeholder="{parent} Clone {number}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{parent}'} for parent name and {'{number}'} for clone number
            </p>
          </div>
        </div>
      );

    case 'harvest_data':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Weight (grams)
            </label>
            <input
              type="number"
              step="0.1"
              value={value.weight || ''}
              onChange={(e) => onChange({ ...value, weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality Rating
            </label>
            <select
              value={value.quality || ''}
              onChange={(e) => onChange({ ...value, quality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            >
              <option value="">Select quality...</option>
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={value.notes || ''}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              placeholder="Harvest notes, observations, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
            />
          </div>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      );
  }
};

const BulkEditModal = ({ isOpen, operation, selectedPlants, onSubmit, onClose }) => {
  const { OPERATION_CONFIGS } = useMultiSelect();
  const [inputData, setInputData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const config = operation ? OPERATION_CONFIGS[operation] : null;

  // Reset form when modal opens/closes or operation changes
  React.useEffect(() => {
    if (isOpen && operation) {
      setInputData({});
      setValidationError(null);
    }
  }, [isOpen, operation]);

  // Validate input data
  const validateInput = useCallback(() => {
    if (!config || !config.requiresInput) return true;

    switch (config.inputType) {
      case 'select':
        return inputData.stage || inputData.status || inputData.value;
      case 'text':
        return inputData.location?.trim();
      case 'textarea':
        return inputData.note?.trim();
      case 'metrics':
        return inputData.height || inputData.width || inputData.nodeCount || inputData.branchCount;
      case 'clone_config':
        return inputData.cloneCount > 0;
      case 'harvest_data':
        return inputData.weight > 0;
      default:
        return true;
    }
  }, [config, inputData]);

  // Estimate completion time
  const estimatedTime = useMemo(() => {
    if (!config || !selectedPlants.length) return 0;
    return (selectedPlants.length * config.estimatedTime) / 1000; // Convert to seconds
  }, [config, selectedPlants.length]);

  const formatEstimatedTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    return `${Math.round(seconds / 60)} minutes`;
  };

  const handleInputChange = useCallback((value) => {
    setInputData(prev => {
      if (typeof value === 'object' && value !== null) {
        return { ...prev, ...value };
      }
      
      // Map single values to appropriate fields based on input type
      switch (config?.inputType) {
        case 'select':
          return { ...prev, [operation === 'update_stage' ? 'stage' : 'status']: value };
        case 'text':
          return { ...prev, location: value };
        case 'textarea':
          return { ...prev, note: value };
        default:
          return { ...prev, value };
      }
    });
    setValidationError(null);
  }, [config?.inputType, operation]);

  const handleSubmit = useCallback(async () => {
    if (!validateInput()) {
      setValidationError('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      let submitData = { ...inputData };
      
      // Transform data for specific operations
      if (operation === 'record_metrics') {
        submitData = { metrics: inputData };
      }

      await onSubmit(operation, submitData);
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateInput, inputData, operation, onSubmit]);

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="mr-2">{config.icon}</span>
            {config.label}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{config.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                <strong>{selectedPlants.length}</strong> plants selected
              </span>
              <span className="text-blue-600">
                Est. time: {formatEstimatedTime(estimatedTime)}
              </span>
            </div>
          </div>
        </div>

        {config.requiresInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.inputType === 'select' ? 'Select Option' :
               config.inputType === 'text' ? 'Enter Value' :
               config.inputType === 'textarea' ? 'Enter Text' :
               config.inputType === 'metrics' ? 'Growth Metrics' :
               config.inputType === 'clone_config' ? 'Clone Configuration' :
               config.inputType === 'harvest_data' ? 'Harvest Data' :
               'Input'}
            </label>
            <InputField
              type={config.inputType}
              value={inputData}
              onChange={handleInputChange}
              placeholder={config.placeholder}
              options={config.inputOptions}
              error={validationError}
            />
            {validationError && (
              <p className="text-sm text-red-600 mt-1">{validationError}</p>
            )}
          </div>
        )}

        {/* Selected Plants Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Plants</h4>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
            {selectedPlants.slice(0, 10).map((plant, index) => (
              <div key={plant.id} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{plant.name}</span>
                  <span className="text-xs text-gray-500">{plant.strain}</span>
                </div>
              </div>
            ))}
            {selectedPlants.length > 10 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                ...and {selectedPlants.length - 10} more plants
              </div>
            )}
          </div>
        </div>

        {/* Warning for destructive operations */}
        {config.destructive && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Warning: Destructive Action</p>
                <p className="text-sm text-red-700">This action cannot be undone.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-patriot-blue"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (config.requiresInput && !validateInput())}
            className={`flex-1 px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              config.destructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-patriot-blue hover:bg-blue-700 focus:ring-patriot-blue'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `${config.label} (${selectedPlants.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

BulkEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  operation: PropTypes.string,
  selectedPlants: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

InputField.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  error: PropTypes.string
};

export default BulkEditModal;
