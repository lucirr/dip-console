export const getRuntimeConfig = () => {
  if (typeof window !== 'undefined') {
    return window.__ENV__ || {};
  }
  
  return {
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
  };
};