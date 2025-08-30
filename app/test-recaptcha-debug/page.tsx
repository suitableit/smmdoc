'use client';

import { useEffect, useState } from 'react';
import ReCAPTCHA from '@/components/ReCAPTCHA';

export default function TestReCAPTCHADebug() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/public/recaptcha-settings');
        const data = await response.json();
        console.log('ReCAPTCHA API Response:', data);
        setApiData(data);
      } catch (err) {
        console.error('Error fetching ReCAPTCHA settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerify = (token: string) => {
    console.log('ReCAPTCHA Token:', token);
    alert('ReCAPTCHA verified! Token: ' + token.substring(0, 50) + '...');
  };

  const handleError = () => {
    console.error('ReCAPTCHA Error');
    alert('ReCAPTCHA Error occurred');
  };

  const handleExpired = () => {
    console.log('ReCAPTCHA Expired');
    alert('ReCAPTCHA Expired');
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">ReCAPTCHA Debug - Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">ReCAPTCHA Debug - Error</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ReCAPTCHA Debug Page</h1>
      
      {/* API Response */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto border">
          {JSON.stringify(apiData, null, 2)}
        </pre>
      </div>

      {/* ReCAPTCHA Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">ReCAPTCHA Widget Test:</h2>
        <div className="border-2 border-blue-200 p-6 rounded-lg bg-blue-50">
          {apiData?.recaptchaSettings?.enabled && apiData?.recaptchaSettings?.siteKey ? (
            <>
              <p className="mb-4 text-green-700 font-medium">
                ✅ ReCAPTCHA is enabled. Testing widget below:
              </p>
              <div className="bg-white p-4 rounded border">
                <ReCAPTCHA
                  siteKey={apiData.recaptchaSettings.siteKey}
                  version={apiData.recaptchaSettings.version || 'v2'}
                  onVerify={handleVerify}
                  onError={handleError}
                  onExpired={handleExpired}
                />
              </div>
            </>
          ) : (
            <div className="text-red-700">
              <p className="font-medium mb-2">❌ ReCAPTCHA cannot be tested:</p>
              <ul className="list-disc list-inside text-sm">
                <li>Enabled: {apiData?.recaptchaSettings?.enabled ? 'Yes' : 'No'}</li>
                <li>Site Key: {apiData?.recaptchaSettings?.siteKey ? 'Present' : 'Missing'}</li>
                <li>Version: {apiData?.recaptchaSettings?.version || 'Not set'}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Browser Console Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Debug Instructions:</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 mb-2">
            📝 <strong>Check Browser Console:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Open Developer Tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Look for ReCAPTCHA-related logs</li>
            <li>Check for any script loading errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}