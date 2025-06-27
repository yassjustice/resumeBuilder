import React, { useState } from 'react';
import { api } from '../../services/api';

const APITestComponent = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testBackendConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic API connectivity
      const response = await fetch('/api/themes');
      const data = await response.json();
      
      setTestResult(`✅ Backend Connected! Found ${data.length} themes. Frontend-Backend communication is working!`);
    } catch (error) {
      setTestResult(`❌ Backend Connection Failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  const testAPIService = async () => {
    setIsLoading(true);
    try {
      const themes = await api.getThemes();
      setTestResult(`✅ API Service Working! Found ${themes.length} themes via API service.`);
    } catch (error) {
      setTestResult(`❌ API Service Failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-3">🔧 API Connection Test</h3>
      <div className="space-y-2">
        <button
          onClick={testBackendConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          {isLoading ? 'Testing...' : 'Test Direct Connection'}
        </button>
        <button
          onClick={testAPIService}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API Service'}
        </button>
      </div>
      {testResult && (
        <div className="mt-3 p-2 bg-white rounded border">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default APITestComponent;
