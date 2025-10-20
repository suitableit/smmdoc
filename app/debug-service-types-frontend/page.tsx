'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import useSWR from 'swr';

// Fetcher function for useSWR (same as in admin services)
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export default function DebugServiceTypesFrontend() {
  const [fetchData, setFetchData] = useState(null);
  const [axiosData, setAxiosData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [axiosError, setAxiosError] = useState(null);

  // Test useSWR with same configuration as admin services
  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
  } = useSWR('/api/admin/service-types', fetcher);

  useEffect(() => {
    console.log('🔍 Frontend Service Types Debug:');
    
    // Test 1: Direct fetch (like our test API page)
    const testFetch = async () => {
      try {
        console.log('📡 Testing direct fetch...');
        const response = await fetch('/api/admin/service-types');
        const data = await response.json();
        console.log('✅ Fetch result:', data);
        setFetchData(data);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setFetchError(err.message);
      }
    };

    // Test 2: Axios instance (like admin services)
    const testAxios = async () => {
      try {
        console.log('📡 Testing axios instance...');
        const response = await axiosInstance.get('/api/admin/service-types');
        console.log('✅ Axios result:', response.data);
        setAxiosData(response.data);
      } catch (err) {
        console.error('❌ Axios error:', err);
        setAxiosError(err.message);
      }
    };

    testFetch();
    testAxios();
  }, []);

  // Debug useSWR data
  useEffect(() => {
    console.log('🔍 useSWR Debug:');
    console.log('📊 swrData:', swrData);
    console.log('📊 swrError:', swrError);
    console.log('📊 swrLoading:', swrLoading);
    if (swrData?.data) {
      console.log('📋 useSWR service types count:', swrData.data.length);
      swrData.data.forEach((type: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${type.id}, Name: ${type.name}`);
      });
    }
  }, [swrData, swrError, swrLoading]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Frontend Service Types Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Direct Fetch Results */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Direct Fetch</h2>
          {fetchError ? (
            <div className="text-red-600">❌ Error: {fetchError}</div>
          ) : fetchData ? (
            <div className="text-green-600">
              ✅ Success: {fetchData?.data?.length || 0} service types
            </div>
          ) : (
            <div className="text-blue-600">🔄 Loading...</div>
          )}
        </div>

        {/* Axios Results */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Axios Instance</h2>
          {axiosError ? (
            <div className="text-red-600">❌ Error: {axiosError}</div>
          ) : axiosData ? (
            <div className="text-green-600">
              ✅ Success: {axiosData?.data?.length || 0} service types
            </div>
          ) : (
            <div className="text-blue-600">🔄 Loading...</div>
          )}
        </div>

        {/* useSWR Results */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">useSWR</h2>
          {swrError ? (
            <div className="text-red-600">❌ Error: {swrError.message}</div>
          ) : swrLoading ? (
            <div className="text-blue-600">🔄 Loading...</div>
          ) : swrData ? (
            <div className="text-green-600">
              ✅ Success: {swrData?.data?.length || 0} service types
            </div>
          ) : (
            <div className="text-gray-600">⏳ No data</div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="mt-8 space-y-6">
        {fetchData && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Direct Fetch Service Types:</h3>
            {fetchData?.data?.map((type: any, index: number) => (
              <div key={type.id} className="mb-1 text-sm">
                {index + 1}. ID: {type.id}, Name: {type.name}
              </div>
            ))}
          </div>
        )}

        {axiosData && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Axios Service Types:</h3>
            {axiosData?.data?.map((type: any, index: number) => (
              <div key={type.id} className="mb-1 text-sm">
                {index + 1}. ID: {type.id}, Name: {type.name}
              </div>
            ))}
          </div>
        )}

        {swrData && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">useSWR Service Types:</h3>
            {swrData?.data?.map((type: any, index: number) => (
              <div key={type.id} className="mb-1 text-sm">
                {index + 1}. ID: {type.id}, Name: {type.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}