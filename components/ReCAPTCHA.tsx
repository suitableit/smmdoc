'use client';

import { useEffect, useRef, useState } from 'react';

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
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

const ReCAPTCHA: React.FC<ReCAPTCHAProps> = ({
  siteKey,
  version,
  action = 'submit',
  threshold = 0.5,
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
          if (window.grecaptcha && window.grecaptcha.render) {
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
          if (window.grecaptcha && window.grecaptcha.render) {
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
      if (window.grecaptcha && window.grecaptcha.ready) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
      if (existingScript) {
        const checkLoaded = () => {
          if (window.grecaptcha && window.grecaptcha.ready) {
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
  }, [siteKey, version]);

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
        } catch (error) {
          console.error('Failed to render reCAPTCHA:', error);
          if (onError) onError();
        }
      }
    }
  }, [isLoaded, siteKey, version, widgetId]); // Removed callback dependencies to prevent re-renders

  // Separate cleanup effect with improved DOM safety
  useEffect(() => {
    return () => {
      if (version === 'v2' && widgetId !== null && window.grecaptcha && typeof widgetId === 'number') {
        try {
          if (window.grecaptcha.reset) {
            window.grecaptcha.reset(widgetId);
          }
          const container = recaptchaRef.current;
          if (container && document.contains(container)) {
            // Safely remove all child nodes
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }
          }
        } catch (error) {
          // Silent cleanup - errors are expected during unmounting
        }
      }
    };
  }, [version, widgetId]);

  const executeV3 = async () => {
    if (!isLoaded || !window.grecaptcha || version !== 'v3') return;

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      onVerify(token);
    } catch (error) {
      console.error('reCAPTCHA v3 execution failed:', error);
      if (onError) onError();
    }
  };

  const reset = () => {
    if (version === 'v2' && widgetId !== null && window.grecaptcha) {
      try {
        // Only attempt reset if the widget ID is valid and grecaptcha is available
        if (typeof widgetId === 'number' && window.grecaptcha.getResponse) {
          // Check if the widget still exists by trying to get its response
          try {
            window.grecaptcha.getResponse(widgetId);
            // If we get here, the widget exists and we can safely reset it
            window.grecaptcha.reset(widgetId);
          } catch (widgetError) {
            // Widget doesn't exist anymore, continue silently
          }
        }
      } catch (error) {
        console.warn('Failed to reset reCAPTCHA widget:', error);
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
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
            } catch (widgetError) {
              // Widget doesn't exist anymore, just log and continue
              console.log('Widget already cleaned up:', widgetError);
            }
          }
          
          // Clear the container safely
          if (recaptchaRef.current && recaptchaRef.current.parentNode) {
            try {
              // Only clear innerHTML if the element is still in the DOM
              recaptchaRef.current.innerHTML = '';
            } catch (domError) {
              console.log('Container already cleaned up:', domError);
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
  }, [isLoaded, version]);

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
                      <span className="text-sm text-gray-700">I'm not a robot (Test Mode)</span>
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