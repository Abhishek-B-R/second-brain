import { DefaultSession, DefaultUser } from "next-auth"
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      isGuest?: boolean
    }
  }
  interface User extends DefaultUser {
    isGuest?: boolean
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    isGuest?: boolean
  }
}

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider  from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Guest",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        isGuest: { label: "Is Guest", type: "text" },
      },
      async authorize(credentials) {
        // Only allow the specific guest account
        if (credentials?.email === "guest@secondbrain.demo" && credentials?.isGuest === "true" && credentials?.name) {
          return {
            id: "guest-user",
            email: "guest@secondbrain.demo",
            name: credentials.name,
            image: null,
            isGuest: true,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.isGuest && session.user) {
        session.user.email = "guest@secondbrain.demo"
        session.user.isGuest = true
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.isGuest) {
        token.isGuest = true
        token.email = "guest@secondbrain.demo"
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}