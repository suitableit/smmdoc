import authConfig from '@/auth.config';
import NextAuth from 'next-auth';
import {
  apiAuthPrefixes,
  authRoutes,
  DEFAULT_SIGN_IN_REDIRECT,
  publicRoutes,
} from './lib/routes';

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = apiAuthPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const callbackUrl =
    nextUrl.searchParams.get('callbackUrl') || DEFAULT_SIGN_IN_REDIRECT;
  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(callbackUrl, nextUrl));
    }
    return;
  }
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
