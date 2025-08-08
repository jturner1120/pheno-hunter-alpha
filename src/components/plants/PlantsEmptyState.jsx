import React from 'react';
import PropTypes from 'prop-types';
import billyBong from '../../assets/billy.png';

const PlantsEmptyState = ({ 
  activeFilter, 
  onAddPlant, 
  showAddButton = true,
  searchTerm = ''
}) => {
  const getEmptyStateContent = () => {
    // Handle search results
    if (searchTerm) {
      return {
        title: "No plants found",
        message: `No plants match "${searchTerm}". Try adjusting your search or filters.`,
        showButton: false
      };
    }

    switch (activeFilter) {
      case 'harvested':
        return {
          title: "No harvested plants found",
          message: "You haven't harvested any plants yet. Keep growing and you'll have harvest data here!",
          showButton: false
        };
      case 'clones':
        return {
          title: "No clones found",
          message: "You haven't created any clones yet. Clone your favorite plants to preserve genetics!",
          showButton: showAddButton
        };
      case 'all':
      case 'active':
      default:
        return {
          title: activeFilter === 'all' 
            ? "No plants yet!" 
            : `No ${activeFilter} plants found`,
          message: activeFilter === 'all'
            ? "Billy's excited to help you start your growing journey! Add your first plant to get started."
            : "No plants match the current filter.",
          showButton: showAddButton
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-12">
      <div className="w-32 h-32 mx-auto mb-6">
        <img 
          src={billyBong} 
          alt="Billy Bong" 
          className="w-full h-full object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold text-patriot-navy mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {content.message}
      </p>
      {content.showButton && (
        <button 
          onClick={onAddPlant}
          className="btn-primary"
        >
          {activeFilter === 'all' ? 'Add Your First Plant' : 'Add a Plant'}
        </button>
      )}
    </div>
  );
};

PlantsEmptyState.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onAddPlant: PropTypes.func.isRequired,
  showAddButton: PropTypes.bool,
  searchTerm: PropTypes.string
};

export default PlantsEmptyState;
