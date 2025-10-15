"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Optimized Supabase Session Synchronizer
 *
 * This component efficiently synchronizes NextAuth and Supabase auth states by:
 * 1. Using the supabaseAccessToken from NextAuth session (generated in session callback)
 * 2. Setting the Supabase session once when NextAuth session becomes available
 * 3. Eliminating the need for onAuthStateChange listeners in individual components
 * 4. Providing automatic sign-out synchronization
 *
 * Usage:
 * - Wrap your app or specific sections with this component
 * - All child components can use Supabase clients without managing auth state
 * - The session is automatically synchronized based on NextAuth state
 */
export default function SupabaseSessionSynchronizer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();

  useEffect(() => {
    // Only proceed if NextAuth has finished loading
    if (nextAuthStatus === "loading") {
      return;
    }

    // Only handle authenticated users with valid Supabase tokens
    if (
      nextAuthStatus === "authenticated" &&
      nextAuthSession?.supabaseAccessToken
    ) {
      try {
        const supabaseClientInstance = createClient();

        // Set the session with the token from NextAuth.js
        // Generate a dummy refresh token since Supabase requires it but NextAuth handles refresh
        const dummyRefreshToken = "nextauth-managed-refresh-token";

        supabaseClientInstance.auth
          .setSession({
            access_token: nextAuthSession.supabaseAccessToken,
            refresh_token: dummyRefreshToken,
          })
          .then(({ data, error }) => {
            if (error) {
              console.error(
                "[SupabaseSessionSynchronizer] Error setting Supabase session from NextAuth token:",
                error,
              );
            } else {
              console.log(
                "[SupabaseSessionSynchronizer] Supabase session successfully set using NextAuth token.",
              );
            }
          })
          .catch((e) => {
            console.error(
              "[SupabaseSessionSynchronizer] Exception during Supabase setSession:",
              e,
            );
          });
      } catch (e) {
        console.error(
          "[SupabaseSessionSynchronizer] Error creating Supabase client:",
          e,
        );
      }
    }
    // Note: We don't actively sign out for unauthenticated users to avoid unnecessary API calls
    // The Supabase client will naturally work in anonymous mode when no session is set
  }, [nextAuthSession, nextAuthStatus]);

  // Return children if provided, otherwise return null (for backward compatibility)
  return children ? <>{children}</> : null;
}
