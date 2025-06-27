import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to console for development
    console.error('🚨 Error Boundary caught an error:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorId);
    }
  }

  reportError = async (error, errorInfo, errorId) => {
    try {
      // This would typically send to an error reporting service like Sentry
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-red-50 rounded border">
                <summary className="cursor-pointer font-medium text-red-800 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-sm text-red-700 font-mono">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Message:</strong> {this.state.error.message}</p>
                  <pre className="whitespace-pre-wrap mt-2 text-xs">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-500 mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
