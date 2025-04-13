import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// export const config = {
//   matcher: [
//     "/catalog/:path*",
//     "/library/:path*",
//     "/settings/:path*",
//     // 추가 보호가 필요한 경로를 여기에 추가
//     // '/api/:path*' 등
//   ],
// };

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Define public paths that don't require authentication
// const PUBLIC_PATHS = ['/login', '/silent-check-sso.html'];

// export function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;
 
//   // Allow access to public paths
//   if (PUBLIC_PATHS.includes(path)) {
//     return NextResponse.next();
//   }

//   // Check for Keycloak token
//   const token = request.cookies.get('keycloak-token');
  
//   // If no token is present, redirect to login
//   if (!token) {
//     //return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };