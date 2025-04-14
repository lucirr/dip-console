import NextAuth from "next-auth";
import { NextAuthOptions, Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import https from 'https';

interface CustomSession extends Session {
    accessToken?: string;
}

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is not set');
}

if (!process.env.KEYCLOAK_CLIENT_ID || !process.env.KEYCLOAK_CLIENT_SECRET || !process.env.KEYCLOAK_ISSUER) {
    throw new Error('Missing required Keycloak environment variables');
}

export const authOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,
            httpOptions: { agent: httpsAgent }
        }),
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT, account: Account | null }) {
            // Include access_token in the token right after signin
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token } : {session: CustomSession, token: JWT}) {
            if (token && typeof token === 'object' && 'accessToken' in token) {
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };