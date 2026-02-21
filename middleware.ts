import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PRODUCTION AUTH MIDDLEWARE
 * Protects routes and handles session redirection.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Retrieve session token from cookies
  const token = request.cookies.get('unifound_auth_token')?.value;

  // 2. Define protected and public routes
  const isAuthPage = pathname === '/login';
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/submit') || pathname.startsWith('/messages') || pathname.startsWith('/profile');

  // 3. Logic for Redirect Loops prevention
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Store original destination to return user after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Optimization: Run middleware only on relevant paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/submit/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/login',
  ],
};