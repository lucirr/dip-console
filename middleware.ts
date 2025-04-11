import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/silent-check-sso.html'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to public paths
  if (PUBLIC_PATHS.includes(path)) {
    return NextResponse.next();
  }

  // Check for Keycloak token
  const token = request.cookies.get('keycloak-token');

  // If no token is present, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};