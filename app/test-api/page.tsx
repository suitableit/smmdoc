'use client';

import { useEffect, useState } from 'react';

export default function TestApiPage() {
  const [serviceTypesData, setServiceTypesData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testServiceTypesAPI = async () => {
      try {
        console.log('🔍 Testing service types API...');
        
        const response = await fetch('/api/admin/service-types');
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw API response:', data);
        console.log('📊 Number of service types returned:', data?.data?.length || 0);
        
        if (data?.data) {
          console.log('📋 Service types list:');
          data.data.forEach((type, index) => {
            console.log(`  ${index + 1}. ID: ${type.id}, Name: ${type.name}, Description: ${type.description}`);
          });
        }
        
        setServiceTypesData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ API Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    testServiceTypesAPI();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Service Types API Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
        
        {loading && (
          <div className="text-blue-600">🔄 Loading...</div>
        )}
        
        {error && (
          <div className="text-red-600">
            <strong>❌ Error:</strong> {error}
          </div>
        )}
        
        {serviceTypesData && (
          <div>
            <div className="text-green-600 mb-4">
              <strong>✅ Success!</strong> API returned {serviceTypesData?.data?.length || 0} service types
            </div>
            
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Service Types Returned:</h3>
              {serviceTypesData?.data?.map((type, index) => (
                <div key={type.id} className="mb-2 p-2 bg-gray-50 rounded">
                  <strong>#{index + 1}</strong> - ID: {type.id}, Name: {type.name}
                  <br />
                  <small className="text-gray-600">Description: {type.description}</small>
                  <br />
                  <small className="text-gray-500">Service Count: {type.serviceCount}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Service Types (9 total):</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>1. Default - Standard quantity-based service</li>
          <li>2. Package - Fixed quantity package service</li>
          <li>3. Special Comments - Service with custom comments</li>
          <li>4. Package Comments - Package with custom comments</li>
          <li>11. Auto Likes - Subscription auto likes service</li>
          <li>12. Auto Views - Subscription auto views service</li>
          <li>13. Auto Comments - Subscription auto comments service</li>
          <li>14. Limited Auto Likes - Limited subscription auto likes</li>
          <li>15. Limited Auto Views - Limited subscription auto views</li>
        </ul>
      </div>
    </div>
  );
}