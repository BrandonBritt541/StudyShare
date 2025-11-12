import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/listings',
  '/messages',
  '/profile',
  '/notifications',
  '/admin',
];

// Routes that should redirect to /listings if already authenticated
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has session (by looking for auth token in cookie)
  const hasSession = request.cookies.has('sb-auth-token') ||
    request.cookies.get('sb-auth-token') ||
    !!request.cookies.getAll().find((c) => c.name.includes('sb-'));

  // Redirect to login if accessing protected route without session
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to listings if accessing auth routes with session
  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/listings', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static assets, API routes, and next internals
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
