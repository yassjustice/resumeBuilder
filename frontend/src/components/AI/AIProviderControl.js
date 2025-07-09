/**
 * AI Provider Control Component
 * Displays current AI provider and allows switching between Gemini and Hugging Face
 */
import React, { useState, useEffect } from 'react';
import './AIProviderControl.css';

const AIProviderControl = ({ className = '' }) => {
  const [providerInfo, setProviderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai-provider/provider/status');
      const data = await response.json();
      
      if (data.success) {
        setProviderInfo(data);
      } else {
        setError(data.error || 'Failed to fetch provider status');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai-provider/provider/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh provider info
        await fetchProviderStatus();
      } else {
        setError(data.error || 'Failed to toggle provider');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setProvider = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai-provider/provider/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh provider info
        await fetchProviderStatus();
      } else {
        setError(data.error || 'Failed to set provider');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai-provider/provider/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('AI Provider test successful! ✅');
      } else {
        setError(data.error || 'Provider test failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gemini':
        return '💎';
      case 'huggingface':
        return '🤗';
      default:
        return '🤖';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'gemini':
        return '#4285f4';
      case 'huggingface':
        return '#ff9500';
      default:
        return '#6b7280';
    }
  };

  if (loading && !providerInfo) {
    return (
      <div className={`ai-provider-control ${className}`}>
        <div className="provider-loading">
          <div className="loading-spinner"></div>
          <span>Loading AI provider info...</span>
        </div>
      </div>
    );
  }

  if (error && !providerInfo) {
    return (
      <div className={`ai-provider-control ${className}`}>
        <div className="provider-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchProviderStatus} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentProvider = providerInfo?.currentProvider;
  const isToggleEnabled = currentProvider?.isToggleEnabled;

  return (
    <div className={`ai-provider-control ${className}`}>
      <div className="provider-header">
        <div className="provider-current">
          <span 
            className="provider-icon"
            style={{ color: getProviderColor(currentProvider?.provider) }}
          >
            {getProviderIcon(currentProvider?.provider)}
          </span>
          <div className="provider-details">
            <div className="provider-name">
              {currentProvider?.provider?.toUpperCase() || 'Unknown'}
            </div>
            <div className="provider-model">
              {currentProvider?.model?.split('/').pop() || 'Unknown Model'}
            </div>
          </div>
        </div>
        
        <div className="provider-actions">
          {isToggleEnabled && (
            <button
              onClick={toggleProvider}
              disabled={loading}
              className="toggle-btn"
              title="Toggle between AI providers"
            >
              🔄
            </button>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="details-btn"
            title="Show/hide details"
          >
            {showDetails ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {error && (
        <div className="provider-error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {showDetails && (
        <div className="provider-details-panel">
          <div className="usage-stats">
            <div className="usage-item">
              <span className="usage-label">Daily Usage:</span>
              <span className="usage-value">{currentProvider?.dailyUsage}</span>
            </div>
            <div className="usage-item">
              <span className="usage-label">Rate Usage:</span>
              <span className="usage-value">{currentProvider?.minuteUsage}</span>
            </div>
          </div>

          <div className="provider-controls">
            <div className="control-section">
              <label>Select Provider:</label>
              <div className="provider-options">
                {currentProvider?.availableProviders?.map(provider => (
                  <button
                    key={provider}
                    onClick={() => setProvider(provider)}
                    disabled={loading || provider === currentProvider.provider}
                    className={`provider-option ${provider === currentProvider.provider ? 'active' : ''}`}
                  >
                    <span className="provider-icon">
                      {getProviderIcon(provider)}
                    </span>
                    <span>{provider.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <button
                onClick={testProvider}
                disabled={loading}
                className="test-btn"
              >
                Test Connectivity
              </button>
            </div>
          </div>

          {providerInfo?.availableModels && (
            <div className="models-info">
              <h4>Available Models:</h4>
              {Object.entries(providerInfo.availableModels).map(([provider, info]) => (
                <div key={provider} className="model-group">
                  <div className="model-header">
                    <span className="provider-icon">
                      {getProviderIcon(provider)}
                    </span>
                    <span className="provider-name">{provider.toUpperCase()}</span>
                    <span className="provider-tier">({info.tier})</span>
                  </div>
                  <div className="model-primary">
                    Primary: <code>{info.primary}</code>
                  </div>
                  <div className="model-features">
                    Features: {info.features.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="provider-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default AIProviderControl;
