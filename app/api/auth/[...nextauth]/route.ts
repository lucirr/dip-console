import NextAuth from "next-auth";
import { Profile } from 'next-auth';
import KeycloakProvider from "next-auth/providers/keycloak";
import https from 'https';
import { getLoginUserRoles } from "@/app/api/user/route";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

interface KeycloakProfile extends Profile {
    preferred_username?: string;
}

// if (!process.env.KEYCLOAK_CLIENT_ID || !process.env.KEYCLOAK_CLIENT_SECRET || !process.env.KEYCLOAK_ISSUER) {
//     throw new Error('Missing required Keycloak environment variables');
// }

const handler = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
            issuer: process.env.KEYCLOAK_ISSUER ?? "",
            httpOptions: { agent: httpsAgent }
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Include access_token in the token right after signin
            if (account?.access_token) {
                token.accessToken = account.access_token;
                const username = (profile as KeycloakProfile).preferred_username;
                
                if (username) {
                    const user = await getLoginUserRoles(username);
                    if (user && user.roles) {
                        token.roles = user.roles;
                        token.uid = user.uid || '0';
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && typeof token === 'object' && 'accessToken' in token) {
                session.accessToken = token.accessToken;
            }
            if ('roles' in token) {
                session.roles = token.roles;
            }
            if ('uid' in token) {
                session.uid = token.uid;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});

export { handler as GET, handler as POST };