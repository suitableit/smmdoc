'use client';

import { useEffect, useState } from 'react';
import ReCAPTCHA from '@/components/ReCAPTCHA';
import useReCAPTCHA from '@/hooks/useReCAPTCHA';

export default function TestReCAPTCHAPage() {
  const { recaptchaSettings, isEnabledForForm, isLoading, error } = useReCAPTCHA();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Debug information
    const checkGrecaptcha = () => {
      setDebugInfo({
        windowGrecaptcha: !!window.grecaptcha,
        grecaptchaReady: !!(window.grecaptcha && window.grecaptcha.ready),
        scriptExists: !!document.querySelector('script[src*="recaptcha/api.js"]'),
        timestamp: new Date().toISOString()
      });
    };

    checkGrecaptcha();
    const interval = setInterval(checkGrecaptcha, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading ReCAPTCHA Settings...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">ReCAPTCHA Test Page</h1>
        
        {/* Debug Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
            <div><strong>Settings Loaded:</strong> {recaptchaSettings ? 'Yes' : 'No'}</div>
            <div><strong>Enabled:</strong> {recaptchaSettings?.enabled ? 'Yes' : 'No'}</div>
            <div><strong>Version:</strong> {recaptchaSettings?.version || 'N/A'}</div>
            <div><strong>Site Key:</strong> {recaptchaSettings?.siteKey || 'N/A'}</div>
            <div><strong>Sign Up Enabled:</strong> {isEnabledForForm('signUp') ? 'Yes' : 'No'}</div>
            <div><strong>Window.grecaptcha:</strong> {debugInfo.windowGrecaptcha ? 'Yes' : 'No'}</div>
            <div><strong>Grecaptcha Ready:</strong> {debugInfo.grecaptchaReady ? 'Yes' : 'No'}</div>
            <div><strong>Script Exists:</strong> {debugInfo.scriptExists ? 'Yes' : 'No'}</div>
            <div><strong>Last Check:</strong> {debugInfo.timestamp}</div>
            <div><strong>ReCAPTCHA Token:</strong> {recaptchaToken ? 'Received' : 'None'}</div>
          </div>
        </div>

        {/* ReCAPTCHA Settings */}
        {recaptchaSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">ReCAPTCHA Settings</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(recaptchaSettings, null, 2)}
            </pre>
          </div>
        )}

        {/* ReCAPTCHA Widget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ReCAPTCHA Widget</h2>
          
          {isEnabledForForm('signUp') && recaptchaSettings ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-green-600">✅ ReCAPTCHA should be enabled for sign up</p>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <ReCAPTCHA
                  siteKey={recaptchaSettings.siteKey}
                  version={recaptchaSettings.version}
                  action="signUp"
                  threshold={recaptchaSettings.threshold}
                  onVerify={(token) => {
                    console.log('ReCAPTCHA verified:', token);
                    setRecaptchaToken(token);
                  }}
                  onError={() => {
                    console.log('ReCAPTCHA error');
                    setRecaptchaToken(null);
                  }}
                  onExpired={() => {
                    console.log('ReCAPTCHA expired');
                    setRecaptchaToken(null);
                  }}
                />
              </div>
              {recaptchaToken && (
                <p className="text-green-600">✅ ReCAPTCHA Token Received!</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-red-600">❌ ReCAPTCHA is not enabled for sign up</p>
              <div className="mt-4 text-sm text-gray-600">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>ReCAPTCHA is disabled globally</li>
                  <li>Sign up form is not enabled in settings</li>
                  <li>Site key is missing</li>
                  <li>Settings failed to load</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Manual Script Loading Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4">Manual Script Test</h2>
          <button
            onClick={() => {
              const script = document.createElement('script');
              script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
              script.onload = () => console.log('Script loaded manually');
              script.onerror = () => console.error('Script failed to load manually');
              document.head.appendChild(script);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load ReCAPTCHA Script Manually
          </button>
        </div>
      </div>
    </div>
  );
}