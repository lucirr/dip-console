// import { authOptions } from '../[...nextauth]/route';

export async function GET() {
  const keycloakLogoutUrl = process.env.KEYCLOAK_ISSUER +`/protocol/openid-connect/logout?redirect_uri=${process.env.NEXTAUTH_URL}`;
  
  return new Response(JSON.stringify({ url: keycloakLogoutUrl }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}