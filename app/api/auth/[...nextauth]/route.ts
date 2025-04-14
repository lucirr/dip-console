import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import https from 'https';
import { getRuntimeConfig } from '../../../../utils/runtime-config';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const config = getRuntimeConfig();
const keycloakIssuer = config.KEYCLOAK_ISSUER

if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is not set');
}

if (!process.env.KEYCLOAK_CLIENT_ID || !process.env.KEYCLOAK_CLIENT_SECRET || !keycloakIssuer) {
    throw new Error('Missing required Keycloak environment variables');
}

const handler = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
            issuer: keycloakIssuer, //process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,
            httpOptions: { agent: httpsAgent }
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Include access_token in the token right after signin
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && typeof token === 'object' && 'accessToken' in token) {
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});

export { handler as GET, handler as POST };