import '@/assets/styles/globals.css';
import { auth } from '@/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/lib/constants';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import { Geist, Geist_Mono } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}`,
  },
  description: `${APP_DESCRIPTION}`,
  metadataBase: new URL(APP_URL || ''),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader />
            <Toaster richColors position="bottom-right" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
