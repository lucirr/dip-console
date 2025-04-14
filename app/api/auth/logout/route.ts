import { authOptions } from '../[...nextauth]/route';

export async function GET() {
    const keycloakLogoutUrl = `${authOptions.providers[0].options?.issuer}/protocol/openid-connect/logout?redirect_uri=`;

    return new Response(JSON.stringify({ url: keycloakLogoutUrl }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}