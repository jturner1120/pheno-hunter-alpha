import React from 'react';
import { useNavigate } from 'react-router-dom';
import billyBong from '../assets/billy.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-patriot-gray flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <div className="w-24 h-24 mx-auto mb-6">
          <img 
            src={billyBong} 
            alt="Billy Bong - Lost!" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <h1 className="text-6xl font-bold text-patriot-red mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-patriot-navy mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-6">
          Oops! Billy can't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full"
          >
            Go to Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/plants')}
            className="btn-secondary w-full"
          >
            View Plants
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="btn-outline w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
