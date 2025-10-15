// This file is used by the middleware and should not import Node.js modules
// It contains a minimal configuration for NextAuth.js

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Auth.js v5 will automatically use AUTH_URL or NEXTAUTH_URL environment variables
// No custom URL derivation is needed

// Export a minimal configuration for middleware (Edge Runtime compatible)
export const authConfig: NextAuthConfig = {
  // Include providers for middleware (but without database-dependent logic)
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      // Simplified credentials provider for middleware
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Return null for middleware - actual auth logic is in auth.ts
        return null;
      },
    }),
  ],
  // Session configuration - use JWT strategy for middleware (Edge Runtime compatible)
  session: {
    strategy: "jwt",
  },

  // Secret is required for JWT validation - use NEXTAUTH_SECRET consistently
  secret: process.env.NEXTAUTH_SECRET,

  // Trust the host for proper cookie handling
  trustHost: true,

  // Set the base path for API routes
  basePath: "/api/auth",

  // Let Auth.js handle cookie configuration with its default settings
  // This ensures consistent cookie naming and behavior
  // Removed custom cookie configuration to prevent conflicts
  // Auth.js will automatically use the correct cookie names and security settings

  // Using modal authentication instead of custom pages
  // Set pages to empty strings to prevent redirects to default NextAuth.js pages
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    verifyRequest: "/",
    newUser: "/",
  },

  // Callbacks for middleware (Edge Runtime compatible)
  callbacks: {
    // JWT callback - required for middleware with JWT sessions
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
        token.role =
          (user as any).role ||
          (user.email === "ishanbestdabang@gmail.com" ? "admin" : "user");
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    // Session callback for middleware - simplified for Edge Runtime
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).role =
          token.role ||
          (session.user.email === "ishanbestdabang@gmail.com"
            ? "admin"
            : "user");
      }
      return session;
    },

    // Authorized callback for middleware - determines if user can access protected routes
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Admin routes require admin role
      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "admin";
      }

      // Account routes require any authenticated user
      if (pathname.startsWith("/account")) {
        return !!auth;
      }

      // All other routes are allowed
      return true;
    },

    // Redirect callback to handle redirects after sign-in
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is already absolute but on the same site, allow it
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default fallback to account page
      return `${baseUrl}/account`;
    },
  },
};
