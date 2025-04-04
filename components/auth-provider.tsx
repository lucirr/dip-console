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
  logout: () => {},
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
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}