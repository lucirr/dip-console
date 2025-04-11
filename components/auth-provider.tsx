'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getKeycloak, initKeycloak, logout } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: Error | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const authenticated = await initKeycloak();

        if (!mounted) return;

        setIsAuthenticated(authenticated);

        if (authenticated) {
          const keycloak = getKeycloak();
          if (keycloak) {
            const profile = await keycloak.loadUserProfile();
            if (mounted) {
              setUser(profile);
            }

            // Set up token refresh
            keycloak.onTokenExpired = () => {
              keycloak.updateToken(70).catch(() => {
                console.error('Failed to refresh token');
                logout();
              });
            };
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize authentication'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
console.log('00000000000000000')
    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    logout,
  };

  if (loading) {
    // return <div>Loading...</div>;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-gray-800" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}