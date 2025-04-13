'use client';

import Keycloak from 'keycloak-js';
import { jwtVerify } from 'jose';

let keycloakInstance: Keycloak | null = null;
let isInitialized = false;

export const getKeycloak = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak.inopt.paasup.io/auth',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'paasup',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'dip-portal',
    });
  }

  return keycloakInstance;
};

export const initKeycloak = async () => {
  const keycloak = getKeycloak();
//   if (!keycloak) return false;
if (!keycloak || isInitialized) return false;

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      // onLoad: 'login-required',
      // checkLoginIframe: false,
      pkceMethod: 'S256',
    });

    if (!authenticated) {
      await keycloak.login();
    }

    isInitialized = true;

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