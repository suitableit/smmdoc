'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Global function to update app name across all contexts
let globalSetAppName: ((name: string) => void) | null = null;

export function updateGlobalAppName(newAppName: string) {
  if (globalSetAppName) {
    globalSetAppName(newAppName);
  }
}

interface AppNameContextType {
  appName: string;
  setAppName: (name: string) => void;
}

const AppNameContext = createContext<AppNameContextType | undefined>(undefined);

export function AppNameProvider({ 
  children, 
  initialAppName 
}: { 
  children: React.ReactNode;
  initialAppName: string;
}) {
  const [appName, setAppName] = useState(initialAppName);

  // Set global reference for updating app name
  useEffect(() => {
    globalSetAppName = setAppName;
    return () => {
      globalSetAppName = null;
    };
  }, [setAppName]);

  return (
    <AppNameContext.Provider value={{ appName, setAppName }}>
      {children}
    </AppNameContext.Provider>
  );
}

export function useAppName() {
  const context = useContext(AppNameContext);
  if (context === undefined) {
    throw new Error('useAppName must be used within an AppNameProvider');
  }
  return context;
}

// Hook for getting app name with fallback
export function useAppNameWithFallback() {
  const context = useContext(AppNameContext);
  if (context === undefined) {
    // Fallback to environment variable if context is not available
    return {
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'SMM Panel',
      setAppName: () => {}
    };
  }
  return context;
}