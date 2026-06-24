import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/config';

const NetworkTest = () => {
  const [testResults, setTestResults] = useState({
    backendHealth: null,
    authEndpoint: null,
    networkInfo: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Test backend connectivity
  const testBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
      });
      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Test auth endpoint
  const testAuthEndpoint = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get network information
  const getNetworkInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'Not available'
    };
  };

  // Run all tests
  const runTests = async () => {
    setIsLoading(true);
    
    const results = {
      backendHealth: await testBackendHealth(),
      authEndpoint: await testAuthEndpoint(),
      networkInfo: getNetworkInfo()
    };
    
    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Network Connectivity Test</h1>
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white px-4 py-2 rounded-md"
            >
              {isLoading ? 'Testing...' : 'Run Tests'}
            </button>
          </div>

          {/* Backend Health Test */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Backend Health Check</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {testResults.backendHealth ? (
                <div>
                  <p className={`font-medium ${testResults.backendHealth.success ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {testResults.backendHealth.success ? 'Connected' : 'Failed'}
                  </p>
                  {testResults.backendHealth.success ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Response Status: {testResults.backendHealth.status}</p>
                      <p className="text-sm text-gray-600">Message: {testResults.backendHealth.data?.message}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 mt-2">Error: {testResults.backendHealth.error}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Testing...</p>
              )}
            </div>
          </div>

          {/* Auth Endpoint Test */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Auth Endpoint Test</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {testResults.authEndpoint ? (
                <div>
                  <p className={`font-medium ${testResults.authEndpoint.success ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {testResults.authEndpoint.success ? 'Reachable' : 'Failed'}
                  </p>
                  {testResults.authEndpoint.success ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Response Status: {testResults.authEndpoint.status}</p>
                      <p className="text-sm text-gray-600">Expected: Invalid credentials (this is normal)</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 mt-2">Error: {testResults.authEndpoint.error}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Testing...</p>
              )}
            </div>
          </div>

          {/* Network Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Network Information</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {testResults.networkInfo ? (
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Platform:</span> {testResults.networkInfo.platform}</p>
                  <p className="text-sm"><span className="font-medium">Online:</span> {testResults.networkInfo.onLine ? 'Yes' : 'No'}</p>
                  <p className="text-sm"><span className="font-medium">Cookies:</span> {testResults.networkInfo.cookieEnabled ? 'Enabled' : 'Disabled'}</p>
                  <p className="text-sm"><span className="font-medium">Language:</span> {testResults.networkInfo.language}</p>
                  {testResults.networkInfo.connection !== 'Not available' && (
                    <div>
                      <p className="text-sm"><span className="font-medium">Connection Type:</span> {testResults.networkInfo.connection.effectiveType}</p>
                      <p className="text-sm"><span className="font-medium">Downlink:</span> {testResults.networkInfo.connection.downlink} Mbps</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">API Configuration</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm"><span className="font-medium">Auth Login:</span> {API_ENDPOINTS.AUTH.LOGIN}</p>
              <p className="text-sm"><span className="font-medium">Auth Register:</span> {API_ENDPOINTS.AUTH.REGISTER}</p>
              <p className="text-sm"><span className="font-medium">Sweets:</span> {API_ENDPOINTS.SWEETS.GET_ALL}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTest;
