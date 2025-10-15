"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/supabase";

/**
 * Creates a Supabase client for browser/client components
 *
 * This client:
 * - Handles client-side authentication and session management
 * - Automatically refreshes tokens
 * - Persists sessions in browser storage
 * - Detects sessions in URLs (for auth callbacks)
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/utils/supabase/client';
 *
 * const supabase = createClient();
 * const { data, error } = await supabase.from('table').select('*');
 * ```
 */
export function createClient() {
  // Validate environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "ERROR: Missing Supabase URL or Anon Key for browser client. Check .env.local and next.config.js for NEXT_PUBLIC_ variable exposure.",
    );
    throw new Error("Supabase browser client configuration error.");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Creates a Supabase client for browser/client components with NextAuth JWT token
 *
 * This client:
 * - Uses the provided NextAuth JWT token for authentication
 * - Respects Row Level Security (RLS) with user context
 * - Should be used when you have access to the NextAuth session
 *
 * Usage:
 * ```typescript
 * import { createClientWithAuth } from '@/utils/supabase/client';
 * import { useSession } from 'next-auth/react';
 *
 * const { data: session } = useSession();
 * const supabase = createClientWithAuth(session?.supabaseAccessToken);
 * const { data, error } = await supabase.from('table').select('*');
 * ```
 */
export function createClientWithAuth(supabaseAccessToken?: string) {
  // Validate environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "ERROR: Missing Supabase URL or Anon Key for browser client. Check .env.local and next.config.js for NEXT_PUBLIC_ variable exposure.",
    );
    throw new Error("Supabase browser client configuration error.");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          // Inject the Supabase JWT token if available
          ...(supabaseAccessToken && {
            Authorization: `Bearer ${supabaseAccessToken}`,
          }),
        },
      },
    },
  );
}

// Export the Database type for convenience
export type { Database };
