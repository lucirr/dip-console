import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
    refreshToken?: string
    idToken?: string
    error?: string
    roles?: string[]
    uid?: string
    nickname?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    idToken?: string
    expiresAt?: number
    error?: string
    roles?: string[]
    uid?: string
    username?: string
    nickname?: string
  }
}