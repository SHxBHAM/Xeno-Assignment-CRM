import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import type { NextRequest } from "next/server"

type UserType = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub,
        } as UserType;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',  // Redirect to your custom login page
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 