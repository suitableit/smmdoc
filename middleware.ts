import authConfig from '@/auth.config';
import NextAuth from 'next-auth';
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
  
  // Skip middleware for all API routes
  if (nextUrl.pathname.startsWith('/api/')) {
    return;
  }
  
  // Set default callback URL based on user role
  let callbackUrl = nextUrl.searchParams.get('callbackUrl');
  
  if (!callbackUrl) {
    // If user is admin, redirect to admin dashboard
    if (isLoggedIn && userRole?.role === 'admin') {
      callbackUrl = '/dashboard/admin';
    } else {
      callbackUrl = DEFAULT_SIGN_IN_REDIRECT;
    }
  }

  // if user is authenticated and trying to access api auth route, redirect to callbackUrl
  if (isApiAuthRoute) {
    return;
  }

  // if user is authenticated and trying to access auth route, redirect to callbackUrl
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect admin to admin dashboard when logging in
      if (userRole?.role === 'admin') {
        return Response.redirect(new URL('/dashboard/admin', nextUrl));
      }
      return Response.redirect(new URL(callbackUrl, nextUrl));
    }
    return;
  }

  // If admin accesses regular dashboard, redirect to admin dashboard
  if (nextUrl.pathname === '/dashboard' && userRole?.role === 'admin') {
    return Response.redirect(new URL('/dashboard/admin', nextUrl));
  }

  // user role can not access admin route
  if (
    nextUrl.pathname.startsWith('/dashboard/admin') &&
    userRole?.role !== 'admin'
  ) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  // admin role can not access user route
  if (
    nextUrl.pathname.startsWith('/dashboard/user') &&
    userRole?.role === 'admin'
  ) {
    return Response.redirect(new URL('/dashboard/admin', nextUrl));
  }

  // unauthenticated users trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(
      new URL(
        `/sign-in?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`,
        nextUrl
      )
    );
  }
  return;
});

export const config = {
  matcher: [
    '/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
