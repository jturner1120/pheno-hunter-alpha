import React from 'react';
import PropTypes from 'prop-types';
import billyBong from '../../assets/billy.png';

const PlantFormHeader = ({ onBackClick }) => {
  return (
    <>
      {/* Page Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={onBackClick}
                className="text-patriot-blue hover:text-blue-700 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-patriot-navy">Add New Plant</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Form Header with Billy */}
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
    </>
  );
};

PlantFormHeader.propTypes = {
  onBackClick: PropTypes.func.isRequired
};

export default PlantFormHeader;
