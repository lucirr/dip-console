import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import https from 'https';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const handler = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
            issuer: process.env.KEYCLOAK_URL + "/realms/" + process.env.KEYCLOAK_REALM,
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