export const getRuntimeConfig = () => {
  if (typeof window !== 'undefined') {
    return window.__RUNTIME_CONFIG__ || {};
  }
  
  return {
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
  };
};