import authConfig from '@/auth.config';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { getClientIP } from './lib/activity-logger';
import {
    apiAuthPrefixes,
    authRoutes,
    DEFAULT_SIGN_IN_REDIRECT,
    publicRoutes,
} from './lib/routes';
import { getTicketSettings } from './lib/utils/ticket-settings';

export const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req?.auth?.user;
  const isApiAuthRoute = apiAuthPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const clientIP = getClientIP(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-client-ip', clientIP);

  const isDatabaseErrorPage = nextUrl.pathname === '/database-error';
  const isTestDbApi = nextUrl.pathname === '/api/test-db';



  const impersonatedUserId = req.cookies.get('impersonated-user-id')?.value;
  const originalAdminId = req.cookies.get('original-admin-id')?.value;
  const isImpersonating = userRole?.isImpersonating || !!impersonatedUserId;

  const callbackUrl =
    nextUrl.searchParams.get('callbackUrl') || DEFAULT_SIGN_IN_REDIRECT;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isPaymentWebhook = nextUrl.pathname.startsWith('/api/payment/webhook');
  if (isApiRoute || isPaymentWebhook || isApiAuthRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const ticketPages = [
    '/admin/tickets',
    '/support-tickets',
  ];

  const isTicketPage = ticketPages.some(page => 
    nextUrl.pathname === page || nextUrl.pathname.startsWith(page + '/')
  );

  if (isTicketPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/sign-in', nextUrl));
    }
    
    try {
      const ticketSettings = await getTicketSettings(true);
      if (!ticketSettings.ticketSystemEnabled) {
        const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, nextUrl));
      }
    } catch (error) {
      console.error('Error checking ticket system status in proxy:', error);
      const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {

      if (isImpersonating) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }

      if (userRole?.role === 'admin') {
        console.log('Admin user detected, redirecting to admin dashboard');
        return NextResponse.redirect(new URL('/admin', nextUrl));
      }
      console.log('Regular user detected, redirecting to user dashboard');
      return NextResponse.redirect(new URL(callbackUrl, nextUrl));
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const contactPages = [
    '/admin/contact-messages',
    '/contact-support',
    '/contact'
  ];

  const isContactPage = contactPages.some(page => 
    nextUrl.pathname === page || nextUrl.pathname.startsWith(page + '/')
  );

  if (isContactPage && isLoggedIn) {
    const isAdminContactMessages = nextUrl.pathname.startsWith('/admin/contact-messages');
    const isAdmin = userRole?.role === 'admin' && !isImpersonating;
    
    if (isAdminContactMessages && isAdmin) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    console.log('Proxy: Contact page detected:', nextUrl.pathname);
    console.log('Proxy: User role:', userRole?.role);
    try {

      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      console.log('Proxy: Fetching contact status from:', `${baseUrl}/api/contact-system-status`);
      const response = await fetch(`${baseUrl}/api/contact-system-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Proxy: API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Proxy: Contact system enabled:', data.contactSystemEnabled);
        if (!data.contactSystemEnabled) {

          const redirectPath = isAdmin ? '/admin' : '/dashboard';
          console.log('Proxy: Redirecting to:', redirectPath);
          return NextResponse.redirect(new URL(redirectPath, nextUrl));
        }
      } else {
        console.log('Proxy: API error, redirecting to safe page');

        const redirectPath = isAdmin ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, nextUrl));
      }
    } catch (error) {
      console.error('Error checking contact system status in proxy:', error);

      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  if (nextUrl.pathname.startsWith('/admin')) {

    if (isImpersonating) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    if (userRole?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  if (nextUrl.pathname.startsWith('/dashboard')) {

    if (userRole?.role === 'admin' && !isImpersonating) {
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
  }

  if (!isLoggedIn && !isPublicRoute) {
    let redirectUrl = `/sign-in`;
    if (nextUrl.pathname !== '/') {
      redirectUrl += `?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
    }
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    '/(api|trpc)(.*)',
  ],
};
