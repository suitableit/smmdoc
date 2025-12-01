'use client';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SWRProvider } from './swr-provider';

function ThemeWatcher() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const body = document.body;
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Remove dark class first to ensure clean state
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Add dark class if needed
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      }
      
      // Force style recalculation by accessing computed styles
      // This ensures all CSS variables and dark: variants are recalculated
      void root.offsetHeight;
      void body.offsetHeight;
      
      // Force recalculation of CSS custom properties
      const computedStyle = window.getComputedStyle(root);
      void computedStyle.getPropertyValue('--primary');
      
      // Dispatch a custom event to notify components of theme change
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: currentTheme, previousTheme: hadDark ? 'dark' : 'light' } 
      }));
    });
  }, [theme, systemTheme, mounted]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    AOS.init({
      once: true,
      duration: 600,
      easing: 'ease-out-sine',
      offset: 0,
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider {...props}>
      <ThemeWatcher />
      <SWRProvider>{children}</SWRProvider>
    </NextThemesProvider>
  );
}
