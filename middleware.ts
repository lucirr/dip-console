import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { menuItems, MenuItem } from "./lib/menu-items";

/**
 * Extracts route permissions from menuItems
 * Creates a mapping of routes to their required roles
 */
const getProtectedRoutes = (): Record<string, string[]> => {
  const routes: Record<string, string[]> = {};

  // Process all menu categories
  Object.values(menuItems).forEach(categoryItems => {
    // Process each menu item in the category
    categoryItems.forEach(item => {
      // Add the main item route
      if (item.href && item.roles) {
        routes[item.href] = [...item.roles];
      }

      // Process any subitems
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          if (subItem.href && subItem.roles) {
            routes[subItem.href] = [...subItem.roles];
          }
        });
      }
    });
  });

  return routes;
};

// Generate protected routes from menu items
const protectedRoutes = getProtectedRoutes();

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Explicitly check for API routes that need authentication
    if (path.startsWith('/api/v1/')) {
      // If no token exists, reject the request
      if (!token) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    // Check if path requires role-based access
    // Use exact match first, then try to find a matching route pattern
    let requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
      path === route
    )?.[1];

    if (requiredRoles) {
      const userRoles = token?.roles as string[] || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        // Redirect to login if user doesn't have required role
        return NextResponse.redirect(new URL('/login', req.url));
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
  matcher: [
    // Include all routes except static assets and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Explicitly include API routes that need protection
    '/api/v1/:path*'
  ],
};
