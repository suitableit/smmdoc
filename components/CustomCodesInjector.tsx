'use client';

import { useEffect, useState } from 'react';

interface CustomCodesSettings {
  headerCodes: string;
  footerCodes: string;
}

export function CustomCodesInjector() {
  const [customCodes, setCustomCodes] = useState<CustomCodesSettings | null>(null);

  const fetchCustomCodes = async () => {
    try {
      const response = await fetch('/api/public/custom-codes');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.customCodesSettings) {
          setCustomCodes(data.customCodesSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching custom codes:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCustomCodes();

    // Listen for custom codes updates
    const handleCustomCodesUpdate = () => {
      fetchCustomCodes();
    };

    window.addEventListener('customCodesUpdated', handleCustomCodesUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener('customCodesUpdated', handleCustomCodesUpdate);
    };
  }, []);

  const executeScripts = (container: HTMLElement) => {
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  };

  useEffect(() => {
    if (!customCodes) return;

    // Inject header codes
    if (customCodes.headerCodes && customCodes.headerCodes.trim()) {
      // Remove any existing custom header codes
      const existingHeaderCodes = document.getElementById('custom-header-codes');
      if (existingHeaderCodes) {
        existingHeaderCodes.remove();
      }

      // Create and inject new header codes
      const headerDiv = document.createElement('div');
      headerDiv.id = 'custom-header-codes';
      headerDiv.innerHTML = customCodes.headerCodes;
      document.head.appendChild(headerDiv);
      
      // Execute any scripts in header codes
      executeScripts(headerDiv);
    }

    // Inject footer codes
    if (customCodes.footerCodes && customCodes.footerCodes.trim()) {
      // Remove any existing custom footer codes
      const existingFooterCodes = document.getElementById('custom-footer-codes');
      if (existingFooterCodes) {
        existingFooterCodes.remove();
      }

      // Create and inject new footer codes
      const footerDiv = document.createElement('div');
      footerDiv.id = 'custom-footer-codes';
      footerDiv.innerHTML = customCodes.footerCodes;
      document.body.appendChild(footerDiv);
      
      // Execute any scripts in footer codes
      executeScripts(footerDiv);
    }

    // Cleanup function
    return () => {
      const headerCodes = document.getElementById('custom-header-codes');
      const footerCodes = document.getElementById('custom-footer-codes');
      if (headerCodes) headerCodes.remove();
      if (footerCodes) footerCodes.remove();
    };
  }, [customCodes]);

  return null; // This component doesn't render anything visible
}