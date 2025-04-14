export const getRuntimeConfig = () => {
  if (typeof window !== 'undefined') {
    return window.__RUNTIME_CONFIG__ || {};
  }
  
  return {
    KEYCLOAK_ISSUER: process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,
  };
};