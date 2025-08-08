import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const FormErrorBoundary = ({ children, formName, onError }) => {
  const fallback = (error, errorInfo, onReset) => (
    <div className="card max-w-md mx-auto">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">🚫</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Form Error
        </h3>
        <p className="text-red-700 mb-4">
          The {formName || 'form'} encountered an error. Your data has been preserved where possible.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> Try refreshing the page or navigating back and trying again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-red-100 rounded p-3 mb-4 text-sm">
            <summary className="cursor-pointer font-medium text-red-800 mb-2">
              Technical Details
            </summary>
            <p className="text-red-700 break-words">
              {error?.toString()}
            </p>
          </details>
        )}
        
        <div className="space-x-3">
          <button
            onClick={onReset}
            className="btn-primary"
          >
            Reset Form
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn-outline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      componentName={formName}
    >
      {children}
    </ErrorBoundary>
  );
};

FormErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  formName: PropTypes.string,
  onError: PropTypes.func
};

export default FormErrorBoundary;
