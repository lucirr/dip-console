'use client';

import Keycloak from 'keycloak-js';
import { jwtVerify } from 'jose';

let keycloakInstance: Keycloak | null = null;

export const getKeycloak = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak.inopt.paasup.io/auth',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'paasup',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'dip-console',
    });
  }

  return keycloakInstance;
};

export const initKeycloak = async () => {
  const keycloak = getKeycloak();
  if (!keycloak) return false;

  try {
    // Check if Keycloak is already initialized to prevent multiple initializations
    if (keycloak.authenticated !== undefined) {
      console.log('Keycloak already initialized, returning current authentication state');
      return keycloak.authenticated;
    }

    const authenticated = await keycloak.init({
      onLoad: 'check-sso',  // Changed from 'login-required' to 'check-sso'
      checkLoginIframe: false,
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    });

    // Store token in cookie for middleware authentication
    if (authenticated && keycloak.token) {
      document.cookie = `keycloak-token=${keycloak.token}; path=/; max-age=${keycloak.tokenParsed?.exp - Math.floor(Date.now() / 1000)}`;
    } else if (!authenticated) {
      await keycloak.login();
    }

    return authenticated;
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error);
    throw error;
  }
};

export const getToken = () => {
  const keycloak = getKeycloak();
  return keycloak?.token;
};

export const updateToken = (minValidity = 5) => {
  const keycloak = getKeycloak();
  return keycloak?.updateToken(minValidity);
};

export const logout = () => {
  const keycloak = getKeycloak();
  return keycloak?.logout();
};

export const hasRole = (role: string) => {
  const keycloak = getKeycloak();
  return keycloak?.hasRealmRole(role) || false;
};

export const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.KEYCLOAK_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};