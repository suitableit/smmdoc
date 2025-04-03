'use client';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SWRProvider } from './swr-provider';
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
      <SWRProvider>{children}</SWRProvider>
    </NextThemesProvider>
  );
}
