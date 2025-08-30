'use client';

import { useEffect, useState } from 'react';
import useReCAPTCHA from '@/hooks/useReCAPTCHA';

export default function DebugReCAPTCHAPage() {
  const { recaptchaSettings, isEnabledForForm, isLoading, error } = useReCAPTCHA();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [manualRender, setManualRender] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setDebugInfo({
        windowGrecaptcha: !!window.grecaptcha,
        grecaptchaReady: !!(window.grecaptcha && window.grecaptcha.ready),
        scriptExists: !!document.querySelector('script[src*="recaptcha/api.js"]'),
        timestamp: new Date().toISOString(),
        recaptchaSettings: recaptchaSettings,
        isEnabledForSignIn: isEnabledForForm('signIn'),
        isLoading,
        error
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [recaptchaSettings, isEnabledForForm, isLoading, error]);

  const renderManualReCAPTCHA = () => {
    if (!window.grecaptcha || !recaptchaSettings?.siteKey) {
      console.error('grecaptcha not loaded or no site key');
      return;
    }

    const container = document.getElementById('manual-recaptcha');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    try {
      const widgetId = window.grecaptcha.render(container, {
        sitekey: recaptchaSettings.siteKey,
        callback: (token: string) => {
          console.log('ReCAPTCHA solved:', token);
          alert('ReCAPTCHA solved successfully!');
        },
        'error-callback': () => {
          console.error('ReCAPTCHA error');
          alert('ReCAPTCHA error occurred');
        },
        'expired-callback': () => {
          console.log('ReCAPTCHA expired');
          alert('ReCAPTCHA expired');
        }
      });
      console.log('Manual ReCAPTCHA rendered with widget ID:', widgetId);
      setManualRender(true);
    } catch (error) {
      console.error('Failed to render manual ReCAPTCHA:', error);
      alert('Failed to render ReCAPTCHA: ' + error);
    }
  };

  const loadReCAPTCHAScript = () => {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      console.log('ReCAPTCHA script already exists');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('ReCAPTCHA script loaded successfully');
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          console.log('ReCAPTCHA ready');
        });
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load ReCAPTCHA script:', error);
    };
    document.head.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">ReCAPTCHA Debug Page</h1>
        
        {/* Debug Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Manual Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Manual Controls</h2>
          <div className="space-x-4">
            <button
              onClick={loadReCAPTCHAScript}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Load ReCAPTCHA Script
            </button>
            <button
              onClick={renderManualReCAPTCHA}
              disabled={!window.grecaptcha || !recaptchaSettings?.siteKey}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Render Manual ReCAPTCHA
            </button>
          </div>
        </div>

        {/* Manual ReCAPTCHA Container */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Manual ReCAPTCHA Widget</h2>
          <div className="flex justify-center">
            <div id="manual-recaptcha" className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
              {manualRender ? '' : 'Click "Render Manual ReCAPTCHA" to test'}
            </div>
          </div>
        </div>

        {/* Current Domain Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Domain Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Current Domain:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
            <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}