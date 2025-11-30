'use client';

import { useEffect } from 'react';

export default function FaviconUpdater() {
  useEffect(() => {
    const checkAndUpdateFavicon = async () => {
      try {
        const response = await fetch('/api/public/general-settings');
        if (response.ok) {
          const data = await response.json();
          const siteIcon = data.success && data.generalSettings?.siteIcon 
            ? data.generalSettings.siteIcon.trim() 
            : '';
          
          console.log('[FaviconUpdater] SiteIcon from API:', siteIcon);
          
          const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']");
          existingLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('/api/favicon') || href.startsWith('/general/') || href.startsWith('/uploads/'))) {
              link.remove();
            }
          });
          
          if (siteIcon !== '') {
            console.log('[FaviconUpdater] Adding favicon links for:', siteIcon);
            const timestamp = Date.now();
            const faviconHref = `/api/favicon?t=${timestamp}`;
            
            const fileExtension = siteIcon.toLowerCase().split('.').pop() || 'png';
            let contentType = 'image/png';
            if (fileExtension === 'ico') contentType = 'image/x-icon';
            else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
            else if (fileExtension === 'gif') contentType = 'image/gif';
            else if (fileExtension === 'svg') contentType = 'image/svg+xml';
            
            const faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            faviconLink.href = faviconHref;
            faviconLink.type = contentType;
            document.head.appendChild(faviconLink);
            
            const shortcutLink = document.createElement('link');
            shortcutLink.rel = 'shortcut icon';
            shortcutLink.href = faviconHref;
            shortcutLink.type = contentType;
            document.head.appendChild(shortcutLink);
            
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = faviconHref;
            document.head.appendChild(appleLink);
          }
        }
      } catch (error) {
        console.error('Error checking favicon:', error);
      }
    };

    checkAndUpdateFavicon();
    
    const timeoutId1 = setTimeout(checkAndUpdateFavicon, 300);
    const timeoutId2 = setTimeout(checkAndUpdateFavicon, 1000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, []);

  return null;
}

