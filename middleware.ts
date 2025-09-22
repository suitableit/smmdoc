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
// import { cookies } from 'next/headers'; // Removed to fix edge runtime error
export const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req?.auth?.user;
  const isApiAuthRoute = apiAuthPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  
  // Capture client IP and add to headers for activity logging
  const clientIP = getClientIP(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-client-ip', clientIP);

  // Skip database check for database error page and test-db API
  const isDatabaseErrorPage = nextUrl.pathname === '/database-error';
  const isTestDbApi = nextUrl.pathname === '/api/test-db';
  
  // Check database connection for all routes except database error page and test-db API
  if (!isDatabaseErrorPage && !isTestDbApi) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      const response = await fetch(`${baseUrl}/api/test-db`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        console.log('Database connection failed, redirecting to error page');
        return NextResponse.redirect(new URL('/database-error', nextUrl));
      }
    } catch (error) {
      console.error('Database connection check failed:', error);
      return NextResponse.redirect(new URL('/database-error', nextUrl));
    }
  }

  // Check for impersonation cookies as fallback since middleware may have stale session
  const impersonatedUserId = req.cookies.get('impersonated-user-id')?.value;
  const originalAdminId = req.cookies.get('original-admin-id')?.value;
  const isImpersonating = userRole?.isImpersonating || !!impersonatedUserId;

  const callbackUrl =
    nextUrl.searchParams.get('callbackUrl') || DEFAULT_SIGN_IN_REDIRECT;

  // Treat all API routes as pass-through (no redirects), including payment webhooks
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isPaymentWebhook = nextUrl.pathname.startsWith('/api/payment/webhook');
  if (isApiRoute || isPaymentWebhook || isApiAuthRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If accessing auth routes while logged in
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Check if user is impersonating - if so, redirect based on impersonated user's role
      if (isImpersonating) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
      // Redirect admin to admin dashboard, users to user dashboard
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

  // Check ticket system status for ticket-related pages
  const ticketPages = [
    '/admin/tickets',
    '/support-tickets',
    '/support-tickets/history'
  ];
  
  const isTicketPage = ticketPages.some(page => 
    nextUrl.pathname === page || nextUrl.pathname.startsWith(page + '/')
  );
  
  if (isTicketPage && isLoggedIn) {
    console.log('Middleware: Ticket page detected:', nextUrl.pathname);
    console.log('Middleware: User role:', userRole?.role);
    try {
      // Use fetch to call our API endpoint since Prisma can't run in middleware
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      console.log('Middleware: Fetching ticket status from:', `${baseUrl}/api/ticket-system-status`);
      const response = await fetch(`${baseUrl}/api/ticket-system-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Middleware: API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Middleware: Ticket system enabled:', data.ticketSystemEnabled);
        if (!data.ticketSystemEnabled) {
          // Redirect based on user role and impersonation status
          const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
          console.log('Middleware: Redirecting to:', redirectPath);
          return NextResponse.redirect(new URL(redirectPath, nextUrl));
        }
      } else {
        console.log('Middleware: API error, redirecting to safe page');
        // On API error, redirect to safe page
        const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, nextUrl));
      }
    } catch (error) {
      console.error('Error checking ticket system status in middleware:', error);
      // On error, redirect to safe page
      const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  // Check contact system status for contact-related pages
  const contactPages = [
    '/admin/contact-messages',
    '/contact-support',
    '/contact'
  ];
  
  const isContactPage = contactPages.some(page => 
    nextUrl.pathname === page || nextUrl.pathname.startsWith(page + '/')
  );
  
  if (isContactPage && isLoggedIn) {
    console.log('Middleware: Contact page detected:', nextUrl.pathname);
    console.log('Middleware: User role:', userRole?.role);
    try {
      // Use fetch to call our API endpoint since Prisma can't run in middleware
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      console.log('Middleware: Fetching contact status from:', `${baseUrl}/api/contact-system-status`);
      const response = await fetch(`${baseUrl}/api/contact-system-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Middleware: API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Middleware: Contact system enabled:', data.contactSystemEnabled);
        if (!data.contactSystemEnabled) {
          // Redirect based on user role and impersonation status
          const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
          console.log('Middleware: Redirecting to:', redirectPath);
          return NextResponse.redirect(new URL(redirectPath, nextUrl));
        }
      } else {
        console.log('Middleware: API error, redirecting to safe page');
        // On API error, redirect to safe page
        const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, nextUrl));
      }
    } catch (error) {
      console.error('Error checking contact system status in middleware:', error);
      // On error, redirect to safe page
      const redirectPath = (userRole?.role === 'admin' && !isImpersonating) ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  // Admin-only routes protection
  if (nextUrl.pathname.startsWith('/admin')) {
    // If impersonating, redirect to user dashboard
    if (isImpersonating) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    // If not admin, redirect to user dashboard
    if (userRole?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }
  
  // User-only routes protection
  if (nextUrl.pathname.startsWith('/dashboard')) {
    // If admin but not impersonating, redirect to admin dashboard
    if (userRole?.role === 'admin' && !isImpersonating) {
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
  }

  // Redirect unauthenticated users to sign-in page
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
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
