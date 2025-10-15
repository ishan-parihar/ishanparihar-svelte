import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string;
      /** The user's role */
      role: string;
      /** Whether the user has an active premium membership */
      has_active_membership: boolean;
    } & DefaultSession["user"];
    /** Supabase access token generated in session callback */
    supabaseAccessToken?: string;
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    has_active_membership: boolean;
  }
}
