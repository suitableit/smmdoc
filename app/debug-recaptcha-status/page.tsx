'use client';

import { useEffect, useState } from 'react';
import useReCAPTCHA from '@/hooks/useReCAPTCHA';
import ReCAPTCHA from '@/components/ReCAPTCHA';

export default function DebugReCAPTCHAStatus() {
  const { recaptchaSettings, isEnabledForForm, isLoading, error } = useReCAPTCHA();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the raw API response to compare
    fetch('/api/public/recaptcha-settings')
      .then(res => res.json())
      .then(data => {
        setApiResponse(data);
      })
      .catch(err => {
        console.error('Failed to fetch API response:', err);
      });
  }, []);

  const handleVerify = (token: string) => {
    setRecaptchaToken(token);
  };

  const handleError = () => {
    console.error('ReCAPTCHA error');
  };

  const handleExpired = () => {
    setRecaptchaToken(null);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading ReCAPTCHA Status...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ReCAPTCHA Debug Status</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw API Response */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Raw API Response</h2>
          <pre className="text-sm overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        {/* Processed Hook Data */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Processed Hook Data</h2>
          <pre className="text-sm overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(recaptchaSettings, null, 2)}
          </pre>
        </div>
      </div>

      {/* Form Enablement Status */}
      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-3">Form Enablement Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['signUp', 'signIn', 'contact', 'supportTicket', 'contactSupport'].map(form => (
            <div key={form} className="text-center">
              <div className={`p-2 rounded ${isEnabledForForm(form as any) ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                <div className="font-semibold">{form}</div>
                <div className="text-sm">{isEnabledForForm(form as any) ? '✅ Enabled' : '❌ Disabled'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ReCAPTCHA Component Test */}
      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-3">ReCAPTCHA Component Test (Sign In)</h2>
        
        {isEnabledForForm('signIn') ? (
          <div className="space-y-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded">
              <p className="mb-2 text-sm text-gray-600">ReCAPTCHA should render below:</p>
              <ReCAPTCHA
                siteKey={recaptchaSettings?.siteKey || ''}
                version={recaptchaSettings?.version || 'v2'}
                onVerify={handleVerify}
                onError={handleError}
                onExpired={handleExpired}
              />
            </div>
            {recaptchaToken && (
              <div className="bg-green-100 p-3 rounded">
                <p className="text-green-800 font-semibold">✅ ReCAPTCHA Token Received!</p>
                <p className="text-xs text-green-600 mt-1 break-all">{recaptchaToken}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-800 font-semibold">❌ ReCAPTCHA not enabled for sign in</p>
            <div className="mt-2 text-sm text-red-600">
              <p>Debugging info:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Global enabled: {recaptchaSettings?.enabled ? 'Yes' : 'No'}</li>
                <li>Sign in enabled: {recaptchaSettings?.enabledForms?.signIn ? 'Yes' : 'No'}</li>
                <li>Site key present: {recaptchaSettings?.siteKey ? 'Yes' : 'No'}</li>
                <li>Site key: {recaptchaSettings?.siteKey || 'None'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Additional Debug Info */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-3">Additional Debug Info</h2>
        <div className="text-sm space-y-1">
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Settings Object:</strong> {recaptchaSettings ? 'Present' : 'Null'}</p>
          <p><strong>API Response:</strong> {apiResponse ? 'Present' : 'Null'}</p>
        </div>
      </div>
    </div>
  );
}