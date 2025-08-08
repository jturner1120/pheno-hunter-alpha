import React from 'react';
import PropTypes from 'prop-types';
import billyBong from '../../assets/billy.png';

const PlantDiary = ({ 
  plant, 
  editingDiary, 
  diaryText, 
  onDiaryTextChange, 
  onDiarySave, 
  onDiaryCancel, 
  onStartEdit 
}) => {
  if (!plant) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-patriot-navy">Grow Diary</h3>
        {plant.status !== 'harvested' && !editingDiary && (
          <button 
            onClick={onStartEdit}
            className="text-patriot-blue hover:text-blue-700 text-sm"
            aria-label="Edit diary"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {editingDiary ? (
        <div className="space-y-4">
          <textarea
            value={diaryText}
            onChange={(e) => onDiaryTextChange(e.target.value)}
            placeholder="Record your observations, feeding schedule, growth milestones, and any notes about this plant..."
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-patriot-blue focus:border-patriot-blue"
            aria-label="Plant diary entry"
          />
          <div className="flex space-x-2">
            <button 
              onClick={onDiarySave} 
              className="btn-primary text-sm"
              aria-label="Save diary entry"
            >
              Save
            </button>
            <button 
              onClick={onDiaryCancel} 
              className="btn-outline text-sm"
              aria-label="Cancel diary editing"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[10rem]">
          {plant.diary ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {plant.diary}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-3">
                <img 
                  src={billyBong} 
                  alt="Billy Bong mascot" 
                  className="w-full h-full object-contain opacity-50" 
                />
              </div>
              <p className="text-sm">No diary entries yet.</p>
              <p className="text-xs">Billy suggests starting with your planting notes!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

PlantDiary.propTypes = {
  plant: PropTypes.shape({
    status: PropTypes.string,
    diary: PropTypes.string
  }),
  editingDiary: PropTypes.bool.isRequired,
  diaryText: PropTypes.string.isRequired,
  onDiaryTextChange: PropTypes.func.isRequired,
  onDiarySave: PropTypes.func.isRequired,
  onDiaryCancel: PropTypes.func.isRequired,
  onStartEdit: PropTypes.func.isRequired
};

PlantDiary.defaultProps = {
  plant: null
};

export default PlantDiary;
