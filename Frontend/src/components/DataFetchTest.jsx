import { useState, useEffect } from 'react';
import { getPublicSweets, adminLogin, getAdminSweets } from '../api/admin';
import { loginUser } from '../api/auth';

// Test component to verify data fetching fixes
const DataFetchTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Public sweets fetch
      console.log('🧪 Testing public sweets fetch...');
      const publicSweetsResponse = await getPublicSweets();
      testResults.publicSweets = {
        success: publicSweetsResponse.success,
        count: publicSweetsResponse.sweets?.length || 0,
        message: publicSweetsResponse.message
      };

      // Test 2: Admin login
      console.log('🧪 Testing admin login...');
      const adminLoginResponse = await adminLogin({
        email: 'admin@sweethub.com',
        password: 'Admin@123'
      });
      testResults.adminLogin = {
        success: adminLoginResponse.success,
        hasToken: !!adminLoginResponse.data?.token,
        message: adminLoginResponse.message
      };

      // Test 3: Admin sweets fetch (if admin login successful)
      if (adminLoginResponse.success && adminLoginResponse.data?.token) {
        console.log('🧪 Testing admin sweets fetch...');
        const adminSweetsResponse = await getAdminSweets(adminLoginResponse.data.token);
        testResults.adminSweets = {
          success: adminSweetsResponse.success,
          count: adminSweetsResponse.data?.sweets?.length || 0,
          message: adminSweetsResponse.message
        };
      }

      // Test 4: Backend health check
      console.log('🧪 Testing backend health...');
      const healthResponse = await fetch('http://localhost:5000/api/health');
      const healthData = await healthResponse.json();
      testResults.backendHealth = {
        success: healthData.success,
        message: healthData.message,
        server: healthData.server
      };

      // Test 5: Debug data endpoint
      console.log('🧪 Testing debug data endpoint...');
      const debugResponse = await fetch('http://localhost:5000/api/debug/data');
      const debugData = await debugResponse.json();
      testResults.debugData = {
        success: debugData.success,
        counts: debugData.data?.counts,
        dbConnected: debugData.data?.database?.connected
      };

    } catch (error) {
      testResults.error = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">SweetHub Data Fetching Test Results</h1>
        
        <button 
          onClick={runTests}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </button>

        <div className="space-y-4">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              
              <div className="space-y-2">
                {result.success !== undefined && (
                  <div className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {result.success ? '✅ Success' : '❌ Failed'}
                  </div>
                )}
                
                {result.message && (
                  <div className="text-gray-600">
                    Message: {result.message}
                  </div>
                )}
                
                {result.count !== undefined && (
                  <div className="text-blue-600">
                    Count: {result.count} items
                  </div>
                )}
                
                {result.hasToken !== undefined && (
                  <div className={result.hasToken ? 'text-green-600' : 'text-red-600'}>
                    Token: {result.hasToken ? 'Present' : 'Missing'}
                  </div>
                )}
                
                {result.counts && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <strong>Database Counts:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Total Sweets: {result.counts.totalSweets}</li>
                      <li>Visible Sweets: {result.counts.visibleSweets}</li>
                      <li>Users: {result.counts.users}</li>
                      <li>Orders: {result.counts.orders}</li>
                    </ul>
                  </div>
                )}
                
                {result.dbConnected !== undefined && (
                  <div className={`text-sm ${result.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
                    Database: {result.dbConnected ? 'Connected' : 'Disconnected'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Ensure backend server is running on port 5000</li>
            <li>Check that MongoDB is connected and has data</li>
            <li>Verify admin credentials (admin@sweethub.com / Admin@123)</li>
            <li>All tests should show ✅ Success status</li>
            <li>Database counts should be greater than 0</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DataFetchTest;