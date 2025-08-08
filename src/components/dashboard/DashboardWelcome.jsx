// src/components/dashboard/DashboardWelcome.jsx
import React from 'react';
import PropTypes from 'prop-types';
import billyBong from '../../assets/billy.png';

const DashboardWelcome = ({ isFirstTime = false }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-patriot-navy mb-4">
        {isFirstTime ? 'Welcome to Pheno Hunter!' : 'Welcome to Your Plant Dashboard'}
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8">
        {isFirstTime 
          ? 'Start your cannabis cultivation journey today. Track plants from seed to harvest, monitor growth, and keep detailed records of your growing experience.'
          : 'Track your cannabis plants from seed to harvest. Monitor growth, clone your best performers, and keep detailed records of your cultivation journey.'
        }
      </p>

      {/* Billy Bong Mascot */}
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4">
          <img 
            src={billyBong} 
            alt="Billy Bong - Pheno Hunter mascot, a friendly cartoon character wearing a cap"
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-patriot-navy mb-2">
          Meet Billy Bong!
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {isFirstTime
            ? 'Your friendly growing companion ready to help you start tracking your first plant!'
            : 'Your friendly growing companion here to help you track your plants from seed to harvest.'
          }
        </p>
      </div>
    </div>
  );
};

DashboardWelcome.propTypes = {
  isFirstTime: PropTypes.bool,
};

export default DashboardWelcome;
