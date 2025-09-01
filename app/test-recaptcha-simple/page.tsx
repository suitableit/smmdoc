'use client';

import { useEffect, useState } from 'react';
import ReCAPTCHA from '@/components/ReCAPTCHA';

export default function TestReCAPTCHASimple() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/recaptcha-settings')
      .then(res => res.json())
      .then(data => {
        console.log('ReCAPTCHA settings from API:', data);
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch ReCAPTCHA settings:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleVerify = (token: string) => {
    console.log('ReCAPTCHA verified with token:', token);
  };

  const handleError = () => {
    console.error('ReCAPTCHA error occurred');
  };

  const handleExpired = () => {
    console.log('ReCAPTCHA expired');
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">ReCAPTCHA Test - Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">ReCAPTCHA Test - Error</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ReCAPTCHA Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">API Settings:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">ReCAPTCHA Component Test:</h2>
        <div className="border p-4 rounded">
          {settings?.enabled && settings?.siteKey ? (
            <ReCAPTCHA
              siteKey={settings.siteKey}
              version={settings.version || 'v2'}
              onVerify={handleVerify}
              onError={handleError}
              onExpired={handleExpired}
            />
          ) : (
            <p className="text-gray-500">
              ReCAPTCHA not enabled or missing site key
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Enabled: {settings?.enabled ? 'Yes' : 'No'}</li>
          <li>Version: {settings?.version || 'Not set'}</li>
          <li>Site Key: {settings?.siteKey ? `${settings.siteKey.substring(0, 20)}...` : 'Not set'}</li>
          <li>Forms: {settings?.forms ? Object.keys(settings.forms).join(', ') : 'None'}</li>
        </ul>
      </div>
    </div>
  );
}