import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const protectedRoutes = {
  '/common-code': ['root'],
  '/sys-catalog-types': ['root'],
  '/cluster': ['root'],
  '/argocd/cluster-registration': ['root'],
  '/argocd/repo-registration': ['root'],
  '/sys-dns-lookup': ['root'],
  '/system-link': ['root'],
  '/cluster-catalog': ['root', 'admin'],
  '/project-catalog': ['root', 'admin'],
  '/system-catalog': ['root', 'admin'],
  '/project-management': ['root', 'admin'],
  '/user-management': ['root', 'admin'],
  '/dns-lookup': ['root', 'admin'],
  '/catalog-types': ['root', 'admin'],
  '/license-management': ['root', 'admin'],
  '/projects': ['root', 'admin', 'manager'],
} as const;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if path requires role-based access
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
      path === route
    )?.[1];

    if (requiredRoles) {
      const userRoles = token?.roles as string[] || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        // Redirect to catalog if user doesn't have required role
        return NextResponse.redirect(new URL('/catalog', req.url));
      }
    }

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
