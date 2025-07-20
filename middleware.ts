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

  // Only log for debugging when needed
  // console.log('Path:', nextUrl.pathname);
  // console.log('User logged in:', isLoggedIn);
  // console.log('User role:', userRole?.role);

  const callbackUrl =
    nextUrl.searchParams.get('callbackUrl') || DEFAULT_SIGN_IN_REDIRECT;



  // If accessing API auth routes
  if (isApiAuthRoute) {
    return;
  }

  // If accessing auth routes while logged in
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect admin to admin dashboard, users to user dashboard
      if (userRole?.role === 'admin') {
        console.log('Admin user detected, redirecting to admin dashboard');
        return Response.redirect(new URL('/admin', nextUrl));
      }
      console.log('Regular user detected, redirecting to user dashboard');
      return Response.redirect(new URL(callbackUrl, nextUrl));
    }
    return;
  }

  // Admin-only routes protection
  if (nextUrl.pathname.startsWith('/admin') && userRole?.role !== 'admin') {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  
  // User-only routes protection
  if (
    nextUrl.pathname.startsWith('/dashboard') &&
    userRole?.role === 'admin'
  ) {
    return Response.redirect(new URL('/admin', nextUrl));
  }

  // Redirect unauthenticated users to sign-in page
  if (!isLoggedIn && !isPublicRoute) {
    let redirectUrl = `/sign-in`;
    if (nextUrl.pathname !== '/') {
      redirectUrl += `?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
    }
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  
  return;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
