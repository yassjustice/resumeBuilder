import React, { useState, useEffect } from 'react';
import './AIProviderToggle.css';

const AIProviderToggle = ({ onProviderChange }) => {
  const [providerInfo, setProviderInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  // Fetch current provider status
  const fetchProviderStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-provider/provider/status');
      const result = await response.json();
      
      if (result.success) {
        setProviderInfo(result.currentProvider);
      } else {
        setError(result.error || 'Failed to fetch provider status');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle provider
  const toggleProvider = async () => {
    if (!providerInfo?.isToggleEnabled) {
      setError('Provider toggle is disabled');
      return;
    }

    setIsToggling(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-provider/provider/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setProviderInfo(result.newProvider);
        if (onProviderChange) {
          onProviderChange(result.newProvider);
        }
      } else {
        setError(result.error || 'Failed to toggle provider');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  // Set specific provider
  const setProvider = async (provider) => {
    setIsToggling(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-provider/provider/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });
      const result = await response.json();
      
      if (result.success) {
        setProviderInfo(result.newProvider);
        if (onProviderChange) {
          onProviderChange(result.newProvider);
        }
      } else {
        setError(result.error || 'Failed to set provider');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  // Test current provider
  const testProvider = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-provider/provider/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`Provider test successful: ${result.testResult?.response || 'OK'}`);
      } else {
        setError(result.error || 'Provider test failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProviderStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !providerInfo) {
    return (
      <div className="ai-provider-toggle loading">
        <div className="spinner"></div>
        <span>Loading provider status...</span>
      </div>
    );
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gemini': return '💎';
      case 'huggingface': return '🤗';
      default: return '🤖';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'gemini': return '#4285f4';
      case 'huggingface': return '#ff6b35';
      default: return '#6c757d';
    }
  };

  return (
    <div className="ai-provider-toggle">
      <div className="provider-header">
        <h3>🤖 AI Provider Control</h3>
        <button 
          className="refresh-btn"
          onClick={fetchProviderStatus}
          disabled={isLoading}
          title="Refresh provider status"
        >
          🔄
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {providerInfo && (
        <div className="provider-info">
          <div className="current-provider">
            <div 
              className="provider-badge"
              style={{ backgroundColor: getProviderColor(providerInfo.provider) }}
            >
              <span className="provider-icon">{getProviderIcon(providerInfo.provider)}</span>
              <span className="provider-name">{providerInfo.provider?.toUpperCase()}</span>
            </div>
            <div className="provider-details">
              <div className="detail-item">
                <span className="label">Model:</span>
                <span className="value">{providerInfo.model}</span>
              </div>
              <div className="detail-item">
                <span className="label">Daily Usage:</span>
                <span className="value">{providerInfo.dailyUsage} ({providerInfo.usagePercentage}%)</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status ${providerInfo.isAvailable ? 'available' : 'unavailable'}`}>
                  {providerInfo.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </span>
              </div>
            </div>
          </div>

          <div className="provider-controls">
            {providerInfo.isToggleEnabled ? (
              <div className="toggle-controls">
                <button
                  className="toggle-btn"
                  onClick={toggleProvider}
                  disabled={isToggling || !providerInfo.isAvailable}
                  title="Toggle between providers"
                >
                  {isToggling ? '🔄 Toggling...' : '🔀 Toggle Provider'}
                </button>
                
                <div className="provider-buttons">
                  {providerInfo.availableProviders?.map(provider => (
                    <button
                      key={provider}
                      className={`provider-btn ${provider === providerInfo.provider ? 'active' : ''}`}
                      onClick={() => setProvider(provider)}
                      disabled={isToggling || provider === providerInfo.provider}
                      style={{ color: getProviderColor(provider) }}
                    >
                      {getProviderIcon(provider)} {provider.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="toggle-disabled">
                <span>🔒 Provider toggle is disabled</span>
              </div>
            )}

            <button
              className="test-btn"
              onClick={testProvider}
              disabled={isLoading || !providerInfo.isAvailable}
              title="Test current provider connectivity"
            >
              {isLoading ? '🧪 Testing...' : '🧪 Test Provider'}
            </button>
          </div>

          {providerInfo.providerStats && (
            <div className="provider-stats">
              <h4>Provider Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Services:</span>
                  <span className="stat-value">{providerInfo.providerStats.totalServices}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Available:</span>
                  <span className="stat-value">{providerInfo.providerStats.availableServices}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Failures:</span>
                  <span className="stat-value">{providerInfo.consecutiveFailures}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIProviderToggle;
