import '@/assets/styles/globals.css';
import { auth } from '@/auth';
import { CustomCodesInjector } from '@/components/CustomCodesInjector';
import { ThemeProvider } from '@/components/theme-provider';
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/lib/constants';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { getUserCurrency } from '@/lib/actions/currency';
import { Nunito } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import StoreProvider from './StoreProvider';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: `%s — ${APP_NAME}`,
    default: `${APP_NAME}`,
  },
  description: `${APP_DESCRIPTION}`,
  metadataBase: new URL(APP_URL || 'http://localhost:3000'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const serverCurrency = await getUserCurrency();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
              <NextTopLoader />
              <Toaster richColors position="bottom-right" />
              <CustomCodesInjector />
              <CurrencyProvider serverCurrency={serverCurrency}>
                <div className="non-sidebar-content font-nunito text-black">
                  {children}
                </div>
              </CurrencyProvider>
            </ThemeProvider>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
