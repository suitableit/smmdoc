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
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha && window.grecaptcha.ready) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
    if (existingScript) {
      // Script is already loading, wait for it
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

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${version === 'v3' ? siteKey : 'explicit'}`;
    script.async = true;
    script.defer = true;
    script.id = 'recaptcha-script';

    script.onload = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
        });
      }
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    // Don't cleanup script on unmount as it might be used by other components
  }, [siteKey, version]);

  useEffect(() => {
    if (!isLoaded || !window.grecaptcha) return;

    if (version === 'v2') {
      // Clean up existing widget if it exists
      if (widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
          setWidgetId(null);
        } catch (error) {
          console.warn('Failed to reset reCAPTCHA widget:', error);
        }
      }

      // Render v2 reCAPTCHA
      if (recaptchaRef.current && widgetId === null) {
        // Clear the container first
        recaptchaRef.current.innerHTML = '';
        
        try {
          // Check if the element already has a reCAPTCHA widget
          if (recaptchaRef.current.children.length === 0) {
            const id = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: siteKey,
              callback: onVerify,
              'error-callback': onError,
              'expired-callback': onExpired,
              size,
              theme
            });
            setWidgetId(id);
          }
        } catch (error) {
          console.error('Failed to render reCAPTCHA:', error);
          if (onError) onError();
        }
      }
    }

    // Cleanup function
    return () => {
      if (version === 'v2' && widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.warn('Failed to cleanup reCAPTCHA widget:', error);
        }
      }
    };
  }, [isLoaded, siteKey, version, onVerify, onError, onExpired, size, theme, widgetId]);

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
        window.grecaptcha.reset(widgetId);
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
          window.grecaptcha.reset(widgetId);
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

  if (version === 'v2') {
    return (
      <div className={`flex justify-center mb-4 ${className || ''}`}>
        <div ref={recaptchaRef}></div>
      </div>
    );
  }

  // v3 is invisible, return null to avoid any spacing
  return null;
};

export default ReCAPTCHA;
export type { ReCAPTCHAProps };