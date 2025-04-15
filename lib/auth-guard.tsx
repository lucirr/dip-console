'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

type RouteGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  console.log(pathname, status);

  useEffect(() => {
    // Skip check for login page
    if (pathname === '/login') {
      return;
    }

    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    const userRoles = session.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // Redirect to default page if user doesn't have required role
      router.push('/catalog');
    }
  }, [session, status, router, allowedRoles, pathname]);

  const userRoles = session?.roles || [];
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return null;
  }

  return <>{children}</>;
}