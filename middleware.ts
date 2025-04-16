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

    // Check if path requires role-based access
    // Use exact match first, then try to find a matching route pattern
    let requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
      path === route
    )?.[1];
    
    // If no exact match, check if the path starts with any protected route
    // This handles nested routes that should inherit parent permissions
    // if (!requiredRoles) {
    //   const matchingRoute = Object.keys(protectedRoutes).find(route =>
    //     path.startsWith(route + '/'));
      
    //   if (matchingRoute) {
    //     requiredRoles = protectedRoutes[matchingRoute];
    //   }
    // }

    if (requiredRoles) {
      const userRoles = token?.roles as string[] || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        // Redirect to catalog if user doesn't have required role
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    console.log(req.headers)

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
