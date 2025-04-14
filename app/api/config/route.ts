import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export async function GET() {

  return Response.json(
    {
      keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
      keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      keycloakIssuer: serverRuntimeConfig.keycloakIssuer || process.env.KEYCLOAK_ISSUER
    }
  );
}