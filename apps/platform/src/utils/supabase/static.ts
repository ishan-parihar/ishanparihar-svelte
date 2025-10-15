import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase";

/**
 * Creates an anonymous Supabase client for static generation and public data fetching
 *
 * This client:
 * - Uses only public environment variables (no cookies or auth)
 * - Is designed for static site generation (SSG) and incremental static regeneration (ISR)
 * - Only accesses public data that doesn't require authentication
 * - Does not handle user sessions or authentication state
 * - Safe to use in generateStaticParams and other static contexts
 *
 * Usage:
 * ```typescript
 * import { createAnonymousClient } from '@/utils/supabase/static';
 *
 * const supabase = createAnonymousClient();
 * const { data, error } = await supabase.from('blog_posts').select('*').eq('draft', false);
 * ```
 */
export function createAnonymousClient() {
  // Validate environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "ERROR: Missing Supabase URL or Anon Key for anonymous client. Check .env.local for NEXT_PUBLIC_ variables.",
    );
    throw new Error("Supabase anonymous client configuration error.");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "X-Client-Info": "supabase-anonymous-static/1.0.0",
        },
      },
      // Disable realtime for better performance in static contexts
      realtime: {
        params: {
          eventsPerSecond: 0, // Disable realtime completely
        },
      },
    },
  );
}

/**
 * Type export for convenience
 */
export type AnonymousSupabaseClient = ReturnType<typeof createAnonymousClient>;
