import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { api } from '../../services/api';

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
        setError(result.message || 'Failed to fetch quota status');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
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
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">AI Quota Status</h3>
        <button
          onClick={() => setShowWidget(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button
              onClick={fetchQuotaStatus}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
            <Button
              onClick={resetQuota}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              🔄 Reset
            </Button>
          </div>
          
          <Button
            onClick={testAPIKeys}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            title="⚠️ WARNING: This will consume ~6 API requests from your quota"
          >
            {isLoading ? '🧪 Testing...' : '⚠️ Test Keys (Uses Quota)'}
          </Button>
        </div>

        {quotaStatus && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-sm">
                <div><strong>Services:</strong> {quotaStatus.summary.activeServices}/{quotaStatus.summary.totalServices} active</div>
                <div><strong>App Usage:</strong> {quotaStatus.summary.totalRequestsToday}/{quotaStatus.summary.totalDailyCapacity} ({quotaStatus.summary.usagePercentage})</div>
                <div><strong>Current:</strong> {quotaStatus.summary.currentService}</div>
              </div>
              <div className="text-xs text-blue-600 mt-2 border-t border-blue-200 pt-2">
                ℹ️ This tracks our app's usage only. For real Google quota status, use "Test Keys" (consumes quota).
              </div>
            </div>

            {/* Service List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {quotaStatus.services.map((service, index) => {
                const usagePercentage = Math.round((service.dailyRequestCount / service.maxRequestsPerDay) * 100);
                
                return (
                  <div key={index} className={`p-2 rounded text-xs ${getStatusColor(service)}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {service.isCurrent && '▶ '}{service.displayName}
                      </span>
                      <span>{service.dailyRequestCount}/{service.maxRequestsPerDay}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getUsageBarColor(usagePercentage)}`}
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
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 className="font-semibold text-yellow-800 mb-2">API Key Test Results</h4>
                <div className="text-xs text-yellow-700 mb-2">
                  <strong>Summary:</strong> {quotaStatus.testResults.summary.working} working, {quotaStatus.testResults.summary.failed} failed, {quotaStatus.testResults.summary.quotaExceeded} quota exceeded
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {quotaStatus.testResults.results.map((result, index) => (
                    <div key={index} className={`p-2 rounded text-xs ${
                      result.status === 'working' ? 'bg-green-100 text-green-800' : 
                      result.is429 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Key {result.keyIndex}</span>
                        <span className={`px-1 rounded ${
                          result.status === 'working' ? 'bg-green-200' : 
                          result.is429 ? 'bg-red-200' : 'bg-gray-200'
                        }`}>
                          {result.status === 'working' ? '✅ OK' : 
                           result.is429 ? '🚫 429' : '❌ ERROR'}
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
