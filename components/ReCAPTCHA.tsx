'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ReCAPTCHAProps {
  siteKey: string;
  version: 'v2' | 'v3';
  action?: string; // Required for v3
  threshold?: number; // For v3, default 0.5
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  className?: string;
  size?: 'compact' | 'normal'; // For v2
  theme?: 'light' | 'dark'; // For v2
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      ready: (callback: () => void) => void;
    };
    onRecaptchaLoad: () => void;
  }
}

const ReCAPTCHA: React.FC<ReCAPTCHAProps> = ({
  siteKey,
  version,
  action = 'submit',
  // threshold: _threshold = 0.5,
  onVerify,
  onError,
  onExpired,
  className = '',
  size = 'normal',
  theme = 'light'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ReCAPTCHA script loading effect triggered:', { version, siteKey });
    
    // For v2, use a simpler loading approach
    if (version === 'v2') {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      if (existingScript) {
        console.log('ReCAPTCHA script already exists');
        // Wait for grecaptcha to be available
        const checkReady = () => {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            console.log('ReCAPTCHA v2 ready (existing script)');
            setIsLoaded(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }

      // Load v2 script with explicit render
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait for grecaptcha to be fully available
        const checkReady = () => {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            setIsLoaded(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load ReCAPTCHA v2 script:', error);
      };
      
      document.head.appendChild(script);
    } else {
      // v3 loading logic (existing)
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
      if (existingScript) {
        const checkLoaded = () => {
          if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
            setIsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setIsLoaded(true);
          });
        }
      };
      
      document.head.appendChild(script);
    }
  }, [siteKey, version]);

  // Reset widget when key dependencies change
  useEffect(() => {
    if (widgetId !== null) {
      setWidgetId(null);
    }
  }, [widgetId, siteKey, version]);

  // Main rendering effect for v2 - optimized to prevent excessive re-renders
  useEffect(() => {
    if (version === 'v2' && isLoaded && recaptchaRef.current && widgetId === null && window.grecaptcha) {
      // Check if container exists and is properly mounted in DOM
      const container = recaptchaRef.current;
      if (container && document.contains(container)) {
        try {
          // Safely clear any existing content
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          
          const newWidgetId = window.grecaptcha.render(container, {
            sitekey: siteKey,
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpired,
            size: size || 'normal',
            theme: theme || 'light',
          });
          setWidgetId(newWidgetId);
        } catch (_error) {
          console.error('Failed to render reCAPTCHA:', _error);
          if (onError) onError();
        }
      }
    }
  }, [isLoaded, siteKey, version, widgetId, onVerify, onError, onExpired, size, theme]);

  // Separate cleanup effect with improved DOM safety
  useEffect(() => {
    const currentRef = recaptchaRef.current;
    return () => {
      if (version === 'v2' && widgetId !== null && window.grecaptcha && typeof widgetId === 'number') {
        try {
          if (window.grecaptcha.reset) {
            window.grecaptcha.reset(widgetId);
          }
          if (currentRef && document.contains(currentRef)) {
            // Safely remove all child nodes
            while (currentRef.firstChild) {
              currentRef.removeChild(currentRef.firstChild);
            }
          }
        } catch {
          // Silent cleanup - errors are expected during unmounting
        }
      }
    };
  }, [version, widgetId]);

  const executeV3 = useCallback(async () => {
    if (!isLoaded || !window.grecaptcha || version !== 'v3') return;

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      onVerify(token);
    } catch (_error) {
      console.error('reCAPTCHA v3 execution failed:', _error);
      if (onError) onError();
    }
  }, [isLoaded, siteKey, version, action, onVerify, onError]);

  // const reset = () => {
  //   if (version === 'v2' && widgetId !== null && window.grecaptcha) {
  //     try {
  //       // Only attempt reset if the widget ID is valid and grecaptcha is available
  //       if (typeof widgetId === 'number' && window.grecaptcha.getResponse) {
  //         // Check if the widget still exists by trying to get its response
  //         try {
  //           window.grecaptcha.getResponse(widgetId);
  //           // If we get here, the widget exists and we can safely reset it
  //           window.grecaptcha.reset(widgetId);
  //         } catch (widgetError) {
  //           // Widget doesn't exist anymore, continue silently
  //         }
  //       }
  //     } catch (error) {
  //       console.warn('Failed to reset reCAPTCHA widget:', error);
  //     }
  //   }
  // };

  // Cleanup on component unmount
  useEffect(() => {
    const currentRef = recaptchaRef.current;
    return () => {
      if (version === 'v2' && widgetId !== null && window.grecaptcha) {
        try {
          // Only attempt cleanup if the widget ID is valid and grecaptcha is available
          if (typeof widgetId === 'number' && window.grecaptcha.getResponse) {
            // Check if the widget still exists by trying to get its response
            try {
              window.grecaptcha.getResponse(widgetId);
              // If we get here, the widget exists and we can safely reset it
              window.grecaptcha.reset(widgetId);
            } catch (_widgetError) {
              // Widget doesn't exist anymore, just log and continue
              console.log('Widget already cleaned up:', _widgetError);
            }
          }
          
          // Clear the container safely
          if (currentRef && currentRef.parentNode) {
            try {
              // Only clear innerHTML if the element is still in the DOM
              currentRef.innerHTML = '';
            } catch (_domError) {
              console.log('Container already cleaned up:', _domError);
            }
          }
          
          setWidgetId(null);
        } catch (error) {
          console.warn('Failed to cleanup reCAPTCHA on unmount:', error);
        }
      }
    };
  }, [version, widgetId]);

  // Expose methods for parent components
  useEffect(() => {
    if (version === 'v3') {
      // Auto-execute v3 when loaded
      executeV3();
    }
  }, [isLoaded, version, executeV3]);

  // Check if this is the test site key
  const isTestKey = siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  if (version === 'v2') {
    return (
      <div className={`flex justify-center mb-4 ${className || ''}`}>
        <div className="w-full">
          {isTestKey && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '12px',
              color: '#856404'
            }}>
              ⚠️ Test reCAPTCHA - This will always pass verification
            </div>
          )}
          <div
            ref={recaptchaRef}
            className="g-recaptcha border border-dashed border-gray-300 p-2"
            style={{ minHeight: '78px' }}
          >
            {/* Only show content when widget is not rendered */}
            {widgetId === null && (
              <>
                {!isLoaded && <span className="text-gray-500 text-sm">Loading ReCAPTCHA script...</span>}
                {isLoaded && !isTestKey && <span className="text-gray-500 text-sm">Rendering widget...</span>}
                {/* Fallback for test environment */}
                {isLoaded && isTestKey && (
                  <div 
                    className="flex items-center justify-center h-16 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      console.log('Test reCAPTCHA clicked - simulating verification');
                      if (onVerify) onVerify('test-token-' + Date.now());
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
                      <span className="text-sm text-gray-700">I&#39;m not a robot (Test Mode)</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // v3 is invisible, return null to avoid any spacing
  return null;
};

export default ReCAPTCHA;
export type { ReCAPTCHAProps };