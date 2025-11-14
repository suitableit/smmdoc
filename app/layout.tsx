import '@/assets/styles/globals.css';
import { auth } from '@/auth';
import { CustomCodesInjector } from '@/components/CustomCodesInjector';
import AnalyticsInjector from '@/components/analytics-injector';
import { ThemeProvider } from '@/components/theme-provider';
import OfflineDetector from '@/components/OfflineDetector';
import { APP_DESCRIPTION, APP_URL } from '@/lib/constants';
import { getAppName } from '@/lib/utils/general-settings';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import { AppNameProvider } from '@/contexts/AppNameContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { getUserCurrency } from '@/lib/actions/currency';
import { Nunito } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import StoreProvider from './StoreProvider';
import UserSwitchWrapper from '@/components/admin/UserSwitchWrapper';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  
  return {
    title: {
      template: `%s — ${appName}`,
      default: `${appName}`,
    },
    description: `${APP_DESCRIPTION}`,
    metadataBase: new URL(APP_URL || 'http://localhost:3000'),
    icons: {
      icon: '/api/favicon',
      shortcut: '/api/favicon',
      apple: '/api/favicon',
    },
    manifest: '/api/manifest',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const serverCurrency = await getUserCurrency();
  const appName = await getAppName();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/api/manifest" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body
        className={`${nunito.variable} font-nunito antialiased text-black`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster richColors position="bottom-right" />
              <CustomCodesInjector />
              <AnalyticsInjector />
              <AppNameProvider initialAppName={appName}>
                <CurrencyProvider serverCurrency={serverCurrency}>
                  <OfflineDetector>
                    <div className="non-sidebar-content font-nunito text-black">
                      {children}
                      <UserSwitchWrapper />
                    </div>
                  </OfflineDetector>
                </CurrencyProvider>
              </AppNameProvider>
            </ThemeProvider>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
