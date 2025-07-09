import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { api } from '../../services/api';
import AIProviderToggle from './AIProviderToggle';

const QuotaStatusWidget = () => {
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWidget, setShowWidget] = useState(false);

  const fetchQuotaStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/quota-status');
      const result = await response.json();
      
      if (result.success) {
        setQuotaStatus(result.data);
      } else {
        setError(result.message || result.error || 'Failed to fetch quota status');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      console.error('Quota status fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuota = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/reset-quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchQuotaStatus(); // Refresh status after reset
      } else {
        setError(result.message || 'Failed to reset quota');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAPIKeys = async () => {
    // Confirm with user that this will consume quota
    const confirmed = window.confirm(
      '⚠️ WARNING: This will test all 6 API keys by making real API calls.\n\n' +
      'This will consume approximately 6 requests from your quota.\n\n' +
      'Are you sure you want to proceed?'
    );
    
    if (!confirmed) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/test-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        // Show detailed test results
        setQuotaStatus({
          ...quotaStatus,
          testResults: result
        });
        console.log('🧪 API Key Test Results:', result);
        
        // Also refresh quota status after testing
        setTimeout(() => {
          fetchQuotaStatus();
        }, 1000);
      } else {
        setError(result.message || 'Failed to test API keys');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showWidget) {
      fetchQuotaStatus();
    }
  }, [showWidget]);

  const getStatusColor = (service) => {
    if (service.isQuotaExceeded) return 'text-red-600 bg-red-50';
    if (service.isCurrent) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!showWidget) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowWidget(true)}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          📊 AI Quota
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80 max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-sm">AI Quota Status</h3>
        <button
          onClick={() => setShowWidget(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 flex-shrink-0">
          <p className="text-xs text-red-600 break-words">{error}</p>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto flex-grow min-h-0">
        <div className="space-y-2 flex-shrink-0">
          <div className="flex space-x-2">
            <Button
              onClick={fetchQuotaStatus}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 text-xs"
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
            <Button
              onClick={resetQuota}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
            >
              🔄 Reset
            </Button>
          </div>
          
          <Button
            onClick={testAPIKeys}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 text-xs"
            title="⚠️ WARNING: This will consume ~6 API requests from your quota"
          >
            {isLoading ? '🧪 Testing...' : '⚠️ Test Keys (Uses Quota)'}
          </Button>
        </div>

        {quotaStatus && (
          <div className="space-y-3">
            {/* AI Provider Control */}
            <div className="flex-shrink-0">
              <AIProviderToggle onProviderChange={() => fetchQuotaStatus()} />
            </div>
            
            {/* Current Provider Summary */}
            {quotaStatus.currentProvider && (
              <div className="bg-indigo-50 border border-indigo-200 rounded p-2 flex-shrink-0">
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Provider:</span>
                    <span className="px-1 py-0.5 bg-indigo-100 rounded text-indigo-800 text-xs">
                      {quotaStatus.currentProvider.provider?.toUpperCase() || 'Unknown'}
                    </span>
                  </div>
                  <div className="truncate"><strong>Model:</strong> {quotaStatus.currentProvider.model || 'Unknown'}</div>
                  <div><strong>Usage:</strong> {quotaStatus.currentProvider.dailyUsage}</div>
                  <div><strong>Status:</strong> 
                    <span className={quotaStatus.currentProvider.isAvailable ? 'text-green-600' : 'text-red-600'}>
                      {quotaStatus.currentProvider.isAvailable ? ' ✅ Available' : ' ❌ Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* System Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2 flex-shrink-0">
              <div className="text-xs">
                <div><strong>Services:</strong> {quotaStatus.summary.activeServices}/{quotaStatus.summary.totalServices} active</div>
                <div><strong>App Usage:</strong> {quotaStatus.summary.totalRequestsToday}/{quotaStatus.summary.totalDailyCapacity}</div>
                <div className="truncate"><strong>Current:</strong> {quotaStatus.summary.currentService}</div>
              </div>
              <div className="text-xs text-blue-600 mt-1 border-t border-blue-200 pt-1">
                ℹ️ App usage tracking only. Use "Test Keys" for real quota.
              </div>
            </div>

            {/* Provider Statistics */}
            {quotaStatus.systemStats && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 flex-shrink-0">
                <h4 className="font-semibold text-gray-800 mb-1 text-xs">Provider Stats</h4>
                <div className="space-y-1">
                  {Object.entries(quotaStatus.systemStats.providers || {}).map(([provider, stats]) => (
                    <div key={provider} className="text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{provider.toUpperCase()}</span>
                        <span className={`px-1 rounded text-xs ${stats.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {stats.status}
                        </span>
                      </div>
                      <div className="text-gray-600 text-xs">
                        {stats.availableServices}/{stats.totalServices} services • {stats.usagePercentage}% used
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${stats.usagePercentage >= 90 ? 'bg-red-500' : stats.usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service List */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {quotaStatus.services.map((service, index) => {
                const usagePercentage = Math.round((service.dailyRequestCount / service.maxRequestsPerDay) * 100);
                
                return (
                  <div key={index} className={`p-1.5 rounded text-xs ${getStatusColor(service)}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium truncate flex-1 mr-2">
                        {service.isCurrent && '▶ '}{service.displayName}
                      </span>
                      <span className="flex-shrink-0">{service.dailyRequestCount}/{service.maxRequestsPerDay}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${getUsageBarColor(usagePercentage)}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    {service.isQuotaExceeded && (
                      <div className="text-xs text-red-500 mt-1">⚠ Quota Exceeded</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Results */}
            {quotaStatus.testResults && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 flex-shrink-0">
                <h4 className="font-semibold text-yellow-800 mb-1 text-xs">API Key Test Results</h4>
                <div className="text-xs text-yellow-700 mb-1">
                  <strong>Summary:</strong> {quotaStatus.testResults.summary.working} working, {quotaStatus.testResults.summary.failed} failed
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {quotaStatus.testResults.results.map((result, index) => (
                    <div key={index} className={`p-1 rounded text-xs ${
                      result.status === 'working' ? 'bg-green-100 text-green-800' : 
                      result.is429 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Key {result.keyIndex}</span>
                        <span className={`px-1 rounded text-xs ${
                          result.status === 'working' ? 'bg-green-200' : 
                          result.is429 ? 'bg-red-200' : 'bg-gray-200'
                        }`}>
                          {result.status === 'working' ? '✅' : 
                           result.is429 ? '🚫' : '❌'}
                        </span>
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1 truncate" title={result.error}>
                          {result.error}
                        </div>
                      )}
                      {result.response && (
                        <div className="text-xs text-green-600 mt-1 truncate" title={result.response}>
                          Response: {result.response}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotaStatusWidget;
