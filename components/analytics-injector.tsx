'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AnalyticsSettings {
  enabled: boolean;
  googleAnalytics: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'not-logged-in' | 'signed-in';
  };
  facebookPixel: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'not-logged-in' | 'signed-in';
  };
  gtm: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'not-logged-in' | 'signed-in';
  };
}

const AnalyticsInjector = () => {
  const [analyticsSettings, setAnalyticsSettings] = useState<AnalyticsSettings | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    const fetchAnalyticsSettings = async () => {
      try {
        const response = await fetch('/api/public/analytics-settings');
        const data = await response.json();
        if (data.success) {
          setAnalyticsSettings(data.analyticsSettings);
        }
      } catch (error) {
        console.error('Failed to fetch analytics settings:', error);
      }
    };

    fetchAnalyticsSettings();
  }, []);

  useEffect(() => {
    if (!analyticsSettings || !analyticsSettings.enabled) {
      console.log('🔍 Analytics: Disabled or not loaded', { analyticsSettings });
      return;
    }

    // Determine if we're on frontend (public) or dashboard/admin (protected) area
    const isFrontend = pathname === '/' || 
                      pathname.startsWith('/about') || 
                      pathname.startsWith('/blogs') || 
                      pathname.startsWith('/contact') || 
                      pathname.startsWith('/our-services');
    
    const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    const shouldShow = (visibility: string) => {
      console.log('🔍 Analytics shouldShow check:', { 
        visibility, 
        isAuthenticated, 
        status, 
        pathname,
        isFrontend,
        isDashboard 
      });
      
      if (visibility === 'all') {
        // All Users: Show on both frontend and dashboard
        console.log('✅ Analytics: Showing for ALL users (frontend + dashboard)');
        return true;
      }
      
      if (visibility === 'not-logged-in') {
        // Not logged in: Show ONLY on frontend for guests
        if (!isAuthenticated && isFrontend) {
          console.log('✅ Analytics: Showing for NOT LOGGED IN users (frontend only)');
          return true;
        }
        console.log('❌ Analytics: NOT showing - not logged in users should only see on frontend');
        return false;
      }
      
      if (visibility === 'signed-in') {
        // Signed in: Show on both frontend and dashboard for logged users
        if (isAuthenticated) {
          console.log('✅ Analytics: Showing for SIGNED IN users (frontend + dashboard)');
          return true;
        }
        console.log('❌ Analytics: NOT showing - user not signed in');
        return false;
      }
      
      console.log('❌ Analytics: NOT showing - visibility rules not met');
      return false;
    };

    console.log('🔍 Analytics visibility check:', {
      pathname,
      isFrontend,
      isDashboard,
      session,
      isAuthenticated,
      status,
      analyticsEnabled: analyticsSettings.enabled,
      googleAnalytics: {
        enabled: analyticsSettings.googleAnalytics.enabled,
        visibility: analyticsSettings.googleAnalytics.visibility,
        shouldShow: shouldShow(analyticsSettings.googleAnalytics.visibility),
        hasCode: !!analyticsSettings.googleAnalytics.code
      },
      facebookPixel: {
        enabled: analyticsSettings.facebookPixel.enabled,
        visibility: analyticsSettings.facebookPixel.visibility,
        shouldShow: shouldShow(analyticsSettings.facebookPixel.visibility),
        hasCode: !!analyticsSettings.facebookPixel.code
      },
      gtm: {
        enabled: analyticsSettings.gtm.enabled,
        visibility: analyticsSettings.gtm.visibility,
        shouldShow: shouldShow(analyticsSettings.gtm.visibility),
        hasCode: !!analyticsSettings.gtm.code
      }
    });

    // Google Analytics
    if (analyticsSettings.googleAnalytics.enabled && 
        analyticsSettings.googleAnalytics.code && 
        shouldShow(analyticsSettings.googleAnalytics.visibility)) {
      
      const gaCode = analyticsSettings.googleAnalytics.code.trim();
      
      // Remove existing GA scripts
      const existingGAScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag"], script[data-analytics="ga"]');
      existingGAScripts.forEach(script => script.remove());

      console.log('🔍 Google Analytics: Injecting code', { gaCode: gaCode.substring(0, 100) + '...' });

      // Check if it's a complete script tag or just a tracking ID
      if (gaCode.includes('<script') || gaCode.includes('gtag') || gaCode.includes('dataLayer')) {
        // It's a complete Google Analytics script - inject as-is
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = gaCode;
        
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach((script, index) => {
          const newScript = document.createElement('script');
          newScript.setAttribute('data-analytics', 'ga');
          
          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          }
          
          if (script.innerHTML) {
            newScript.innerHTML = script.innerHTML;
          }
          
          // Copy other attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'src' && attr.name !== 'async') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          
          document.head.appendChild(newScript);
        });
      } else {
        // It's just a tracking ID - create the standard GA script
        const trackingId = gaCode.replace(/[^A-Z0-9-]/g, ''); // Clean the ID
        
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        gaScript.setAttribute('data-analytics', 'ga');
        document.head.appendChild(gaScript);

        const gaConfigScript = document.createElement('script');
        gaConfigScript.setAttribute('data-analytics', 'ga');
        gaConfigScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `;
        document.head.appendChild(gaConfigScript);
      }
    }

    // Facebook Pixel
    if (analyticsSettings.facebookPixel.enabled && 
        analyticsSettings.facebookPixel.code && 
        shouldShow(analyticsSettings.facebookPixel.visibility)) {
      
      const fbCode = analyticsSettings.facebookPixel.code.trim();
      
      // Remove existing FB Pixel scripts
      const existingFBScripts = document.querySelectorAll('script[data-analytics="fb"], noscript[data-analytics="fb"]');
      existingFBScripts.forEach(script => script.remove());

      console.log('🔍 Facebook Pixel: Injecting code', { fbCode: fbCode.substring(0, 100) + '...' });

      // Check if it's a complete script tag or just a pixel ID
      if (fbCode.includes('<script') || fbCode.includes('fbq') || fbCode.includes('facebook.net')) {
        // It's a complete Facebook Pixel script - inject as-is
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fbCode;
        
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach((script, index) => {
          const newScript = document.createElement('script');
          newScript.setAttribute('data-analytics', 'fb');
          
          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          }
          
          if (script.innerHTML) {
            newScript.innerHTML = script.innerHTML;
          }
          
          // Copy other attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'src' && attr.name !== 'async') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          
          document.head.appendChild(newScript);
        });

        // Handle noscript tags
        const noscripts = tempDiv.querySelectorAll('noscript');
        noscripts.forEach((noscript, index) => {
          const newNoscript = document.createElement('noscript');
          newNoscript.setAttribute('data-analytics', 'fb');
          newNoscript.innerHTML = noscript.innerHTML;
          document.head.appendChild(newNoscript);
        });
      } else {
        // It's just a pixel ID - create the standard FB Pixel script
        const pixelId = fbCode.replace(/[^0-9]/g, ''); // Clean the ID
        
        const fbScript = document.createElement('script');
        fbScript.setAttribute('data-analytics', 'fb');
        fbScript.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(fbScript);

        // Add noscript fallback
        const fbNoscript = document.createElement('noscript');
        fbNoscript.setAttribute('data-analytics', 'fb');
        fbNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
        document.head.appendChild(fbNoscript);
      }
    }

    // Google Tag Manager
    if (analyticsSettings.gtm.enabled && 
        analyticsSettings.gtm.code && 
        shouldShow(analyticsSettings.gtm.visibility)) {
      
      const gtmCode = analyticsSettings.gtm.code.trim();
      
      // Remove existing GTM scripts
      const existingGTMScripts = document.querySelectorAll('script[data-analytics="gtm"], noscript[data-analytics="gtm"]');
      existingGTMScripts.forEach(script => script.remove());

      console.log('🔍 Google Tag Manager: Injecting code', { gtmCode: gtmCode.substring(0, 100) + '...' });

      // Check if it's a complete script tag or just a container ID
      if (gtmCode.includes('<script') || gtmCode.includes('gtm.js') || gtmCode.includes('dataLayer')) {
        // It's a complete GTM script - inject as-is
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = gtmCode;
        
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach((script, index) => {
          const newScript = document.createElement('script');
          newScript.setAttribute('data-analytics', 'gtm');
          
          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          }
          
          if (script.innerHTML) {
            newScript.innerHTML = script.innerHTML;
          }
          
          // Copy other attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'src' && attr.name !== 'async') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          
          document.head.appendChild(newScript);
        });

        // Handle noscript tags
        const noscripts = tempDiv.querySelectorAll('noscript');
        noscripts.forEach((noscript, index) => {
          const newNoscript = document.createElement('noscript');
          newNoscript.setAttribute('data-analytics', 'gtm');
          newNoscript.innerHTML = noscript.innerHTML;
          document.body.appendChild(newNoscript);
        });
      } else {
        // It's just a container ID - create the standard GTM script
        const containerId = gtmCode.replace(/[^A-Z0-9-]/g, ''); // Clean the ID
        
        const gtmScript = document.createElement('script');
        gtmScript.setAttribute('data-analytics', 'gtm');
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${containerId}');
        `;
        document.head.appendChild(gtmScript);

        // Add GTM noscript fallback to body
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.setAttribute('data-analytics', 'gtm');
        gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.appendChild(gtmNoscript);
      }
    }

    // Cleanup function
    return () => {
      // Clean up analytics scripts when component unmounts or settings change
      const analyticsScripts = document.querySelectorAll('script[data-analytics]');
      analyticsScripts.forEach(script => script.remove());
      
      const analyticsNoscripts = document.querySelectorAll('noscript[data-analytics]');
      analyticsNoscripts.forEach(noscript => noscript.remove());
    };
  }, [analyticsSettings, isAuthenticated, pathname]);

  return null; // This component doesn't render anything visible
};

export default AnalyticsInjector;