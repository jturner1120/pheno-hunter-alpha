// src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-patriot-navy">Pheno Hunter</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.username || 'Grower'}!
            </span>
            <button 
              onClick={onLogout}
              className="btn-outline text-sm py-1 px-3 hover:bg-gray-50 transition-colors"
              aria-label="Logout from your account"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default DashboardHeader;
