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

  // Only log for debugging when needed
  // console.log('Path:', nextUrl.pathname);
  // console.log('User logged in:', isLoggedIn);
  // console.log('User role:', userRole?.role);

  const callbackUrl =
    nextUrl.searchParams.get('callbackUrl') || DEFAULT_SIGN_IN_REDIRECT;



  // If accessing API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If accessing auth routes while logged in
  if (isAuthRoute) {
    if (isLoggedIn) {
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

  // Admin-only routes protection
  if (nextUrl.pathname.startsWith('/admin') && userRole?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
  
  // User-only routes protection
  if (
    nextUrl.pathname.startsWith('/dashboard') &&
    userRole?.role === 'admin'
  ) {
    return NextResponse.redirect(new URL('/admin', nextUrl));
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
