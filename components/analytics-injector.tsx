'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AnalyticsSettings {
  enabled: boolean;
  googleAnalytics: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'guests' | 'users';
  };
  facebookPixel: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'guests' | 'users';
  };
  gtm: {
    enabled: boolean;
    code: string;
    visibility: 'all' | 'guests' | 'users';
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
    if (!analyticsSettings || !analyticsSettings.enabled) return;

    const shouldShow = (visibility: string) => {
      if (visibility === 'all') return true;
      if (visibility === 'guests' && !isAuthenticated) return true;
      if (visibility === 'users' && isAuthenticated) return true;
      return false;
    };

    // Google Analytics
    if (analyticsSettings.googleAnalytics.enabled && 
        analyticsSettings.googleAnalytics.code && 
        shouldShow(analyticsSettings.googleAnalytics.visibility)) {
      
      const gaCode = analyticsSettings.googleAnalytics.code;
      
      // Remove existing GA scripts
      const existingGAScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag"]');
      existingGAScripts.forEach(script => script.remove());
      
      const existingGAConfig = document.querySelectorAll('script[data-analytics="ga"]');
      existingGAConfig.forEach(script => script.remove());

      // Add Google Analytics
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaCode}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.setAttribute('data-analytics', 'ga');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaCode}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Facebook Pixel
    if (analyticsSettings.facebookPixel.enabled && 
        analyticsSettings.facebookPixel.code && 
        shouldShow(analyticsSettings.facebookPixel.visibility)) {
      
      const fbCode = analyticsSettings.facebookPixel.code;
      
      // Remove existing FB Pixel scripts
      const existingFBScripts = document.querySelectorAll('script[data-analytics="fb"]');
      existingFBScripts.forEach(script => script.remove());

      // Add Facebook Pixel
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
        fbq('init', '${fbCode}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      // Add noscript fallback
      const existingFBNoscript = document.querySelectorAll('noscript[data-analytics="fb"]');
      existingFBNoscript.forEach(noscript => noscript.remove());

      const fbNoscript = document.createElement('noscript');
      fbNoscript.setAttribute('data-analytics', 'fb');
      fbNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbCode}&ev=PageView&noscript=1" />`;
      document.head.appendChild(fbNoscript);
    }

    // Google Tag Manager
    if (analyticsSettings.gtm.enabled && 
        analyticsSettings.gtm.code && 
        shouldShow(analyticsSettings.gtm.visibility)) {
      
      const gtmCode = analyticsSettings.gtm.code;
      
      // Remove existing GTM scripts
      const existingGTMScripts = document.querySelectorAll('script[data-analytics="gtm"]');
      existingGTMScripts.forEach(script => script.remove());

      // Add Google Tag Manager
      const gtmScript = document.createElement('script');
      gtmScript.setAttribute('data-analytics', 'gtm');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmCode}');
      `;
      document.head.appendChild(gtmScript);

      // Add GTM noscript fallback to body
      const existingGTMNoscript = document.querySelectorAll('noscript[data-analytics="gtm"]');
      existingGTMNoscript.forEach(noscript => noscript.remove());

      const gtmNoscript = document.createElement('noscript');
      gtmNoscript.setAttribute('data-analytics', 'gtm');
      gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmCode}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.appendChild(gtmNoscript);
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