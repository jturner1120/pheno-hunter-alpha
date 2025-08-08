import React from 'react';
import PropTypes from 'prop-types';

const PlantInfo = ({ 
  plant, 
  copyToast, 
  onCopyUid, 
  onImageUpload, 
  isUploading,
  formatDate,
  getDaysOld 
}) => {
  if (!plant) return null;

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-patriot-navy mb-2">{plant.name}</h2>
        <div className="flex items-center justify-center space-x-2 mb-4">
          {plant.status === 'harvested' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              🌾 Harvested
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              🌱 {plant.status} ({getDaysOld(plant.createdAt)} days old)
            </span>
          )}
        </div>
      </div>

      {/* Copy Toast */}
      {copyToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">{copyToast}</p>
        </div>
      )}

      {/* Plant Image */}
      <div className="mb-6">
        <div className="relative">
          {(plant.imageUrl || plant.image) ? (
            <img
              src={plant.imageUrl || plant.image}
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
          
          {plant.status !== 'harvested' && (
            <div className="absolute bottom-2 right-2">
              <label className="bg-patriot-blue text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e.target.files[0])}
                  className="hidden"
                  disabled={isUploading}
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
            <p className="text-gray-900">{plant.strain}</p>
          </div>
          {plant.uid && (
            <div>
              <span className="font-medium text-gray-600">Plant UID:</span>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 font-mono text-sm">{plant.uid}</p>
                <button
                  onClick={onCopyUid}
                  className="text-patriot-blue hover:text-blue-700 p-1 rounded"
                  title="Copy UID to clipboard"
                  aria-label="Copy UID to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-600">Origin:</span>
            <p className="text-gray-900">
              {plant.isClone ? '🌿 Clone' : '🌰 Seed'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Date Planted:</span>
            <p className="text-gray-900">{formatDate(plant.createdAt)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Generation:</span>
            <p className="text-gray-900">Gen {(plant.cloneGeneration || 0) + 1}</p>
          </div>
        </div>

        {/* Harvest Stats */}
        {plant.status === 'harvested' && plant.harvests?.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Harvest Stats</h4>
            {plant.harvests.map((harvest, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <span className="font-medium text-gray-600">Weight:</span>
                  <p className="text-gray-900">{harvest.weight}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Quality:</span>
                  <p className="text-gray-900">{harvest.quality}</p>
                </div>
                {harvest.notes && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Notes:</span>
                    <p className="text-gray-900">{harvest.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

PlantInfo.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    strain: PropTypes.string.isRequired,
    uid: PropTypes.string,
    status: PropTypes.string,
    isClone: PropTypes.bool,
    cloneGeneration: PropTypes.number,
    createdAt: PropTypes.any,
    imageUrl: PropTypes.string,
    image: PropTypes.string,
    harvests: PropTypes.array
  }),
  copyToast: PropTypes.string,
  onCopyUid: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
  formatDate: PropTypes.func.isRequired,
  getDaysOld: PropTypes.func.isRequired
};

PlantInfo.defaultProps = {
  plant: null,
  copyToast: '',
  isUploading: false
};

export default PlantInfo;
