export async function GET() {
  return Response.json(
    {
      keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
      keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      keycloakIssuer: process.env.KEYCLOAK_ISSUER
    }
  );
}