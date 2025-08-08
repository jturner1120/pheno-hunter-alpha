import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and external service (if configured)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset)
      ) : (
        <DefaultErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, errorInfo, onReset, componentName }) => {
  return (
    <div className="min-h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Something went wrong
        </h3>
        <p className="text-red-700 mb-4">
          {componentName ? `The ${componentName} component` : 'A component'} encountered an error and couldn't be displayed.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-red-100 rounded p-3 mb-4 text-sm">
            <summary className="cursor-pointer font-medium text-red-800 mb-2">
              Error Details (Development Only)
            </summary>
            <div className="text-red-700">
              <strong>Error:</strong> {error.toString()}
              {errorInfo && (
                <div className="mt-2">
                  <strong>Component Stack:</strong>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
        
        <div className="space-x-3">
          <button
            onClick={onReset}
            className="btn-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  componentName: PropTypes.string
};

DefaultErrorFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  onReset: PropTypes.func.isRequired,
  componentName: PropTypes.string
};

export default ErrorBoundary;
