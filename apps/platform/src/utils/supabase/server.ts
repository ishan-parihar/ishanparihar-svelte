import "server-only";
import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/lib/supabase";
import { auth } from "@/auth";

// Helper function to combine multiple AbortSignals
// Preserved from the original implementation
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}

// Enhanced fetch wrapper with timeout for server-side Supabase clients
// This is preserved from the original implementation as it provides important
// timeout protection for server-side requests
function createTimeoutFetch(timeoutMs: number = 10000) {
  return (url: RequestInfo | URL, options?: RequestInit) => {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const actualOptions = {
      ...options,
      signal: options?.signal
        ? anySignal([options.signal, timeoutSignal])
        : timeoutSignal,
    };
    return fetch(url, actualOptions);
  };
}

/**
 * Creates a Supabase client for Server Components with NextAuth authentication
 *
 * This client:
 * - Respects Row Level Security (RLS) and uses NextAuth user authentication context
 * - Automatically injects the Supabase JWT token from NextAuth session
 * - Does not auto-refresh tokens (not needed in server components)
 * - Does not persist sessions (not needed in server components)
 * - Includes timeout protection for server requests
 *
 * Usage:
 * ```typescript
 * import { createServerClient } from '@/utils/supabase/server';
 *
 * const supabase = await createServerClient();
 * const { data, error } = await supabase.from('table').select('*');
 * ```
 */
export async function createServerClient<T = Database>() {
  const cookieStore = await cookies();

  // Get the NextAuth session to extract the Supabase JWT token
  const session = await auth();

  // Debug logging for Supabase server client
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" &&
    process.env.SUPABASE_DEBUG === "true";
  if (DEBUG_MODE) {
    console.log("[Supabase Server Client] Session info:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      hasSupabaseToken: !!session?.supabaseAccessToken,
      supabaseTokenLength: session?.supabaseAccessToken?.length,
    });
  }

  const client = createSupabaseServerClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        autoRefreshToken: false, // Not needed in server components
        persistSession: false, // Not needed in server components
        detectSessionInUrl: false, // NextAuth handles URL session detection
      },
      global: {
        fetch: createTimeoutFetch(5000), // Reduced to 5-second timeout for faster failures
        headers: {
          "X-Client-Info": "supabase-server-component/2.0.0",
          Connection: "keep-alive", // Reuse connections
          // Inject the Supabase JWT token if available
          ...(session?.supabaseAccessToken && {
            Authorization: `Bearer ${session.supabaseAccessToken}`,
          }),
        },
      },
    },
  );

  return client;
}

/**
 * Creates a Supabase client for Route Handlers (API routes) with NextAuth authentication
 *
 * This client:
 * - Respects Row Level Security (RLS) and uses NextAuth user authentication context
 * - Automatically injects the Supabase JWT token from NextAuth session
 * - Can set cookies in the response
 * - Includes timeout protection for server requests
 *
 * Usage:
 * ```typescript
 * import { createRouteHandlerClient } from '@/utils/supabase/server';
 *
 * export async function GET(request: NextRequest) {
 *   const supabase = await createRouteHandlerClient();
 *   const { data, error } = await supabase.from('table').select('*');
 *   return NextResponse.json({ data });
 * }
 * ```
 */
export async function createRouteHandlerClient<T = Database>() {
  const cookieStore = await cookies();

  // Get the NextAuth session to extract the Supabase JWT token
  const session = await auth();

  // Debug logging for Supabase route handler client
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" &&
    process.env.SUPABASE_DEBUG === "true";
  if (DEBUG_MODE) {
    console.log("[Supabase Route Handler Client] Session info:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      hasSupabaseToken: !!session?.supabaseAccessToken,
      supabaseTokenLength: session?.supabaseAccessToken?.length,
    });
  }

  return createSupabaseServerClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        autoRefreshToken: false, // Not needed in route handlers
        persistSession: false, // Not needed in route handlers
        detectSessionInUrl: false, // NextAuth handles URL session detection
      },
      global: {
        fetch: createTimeoutFetch(5000), // Reduced to 5-second timeout for faster failures
        headers: {
          "X-Client-Info": "supabase-route-handler/2.0.0",
          Connection: "keep-alive", // Reuse connections
          // Inject the Supabase JWT token if available
          ...(session?.supabaseAccessToken && {
            Authorization: `Bearer ${session.supabaseAccessToken}`,
          }),
        },
      },
    },
  );
}

/**
 * Creates a Supabase client for Middleware
 *
 * This client:
 * - Can read and write cookies in middleware context
 * - Used for session refresh in middleware
 * - Includes timeout protection
 *
 * Usage:
 * ```typescript
 * import { createMiddlewareClient } from '@/utils/supabase/server';
 *
 * export async function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   const supabase = createMiddlewareClient(request, response);
 *   await supabase.auth.getUser(); // Refresh session
 *   return response;
 * }
 * ```
 */
export function createMiddlewareClient<T = Database>(
  request: Request,
  response: Response,
) {
  return createSupabaseServerClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.headers
            .get("cookie")
            ?.split(";")
            .find((c) => c.trim().startsWith(`${name}=`))
            ?.split("=")[1];
        },
        set(name: string, value: string, options: CookieOptions) {
          response.headers.append(
            "Set-Cookie",
            `${name}=${value}; ${Object.entries(options)
              .map(([key, val]) => `${key}=${val}`)
              .join("; ")}`,
          );
        },
        remove(name: string, options: CookieOptions) {
          response.headers.append(
            "Set-Cookie",
            `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(
              options,
            )
              .map(([key, val]) => `${key}=${val}`)
              .join("; ")}`,
          );
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: createTimeoutFetch(10000),
        headers: {
          "X-Client-Info": "supabase-middleware/2.0.0",
        },
      },
    },
  );
}

// Cache for service role client to prevent repeated creation
let serviceRoleClientCache: any = null;
let serviceRoleClientCacheTime = 0;
const SERVICE_ROLE_CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Creates a Supabase client with Service Role privileges (cached)
 *
 * ⚠️ WARNING: This client BYPASSES Row Level Security (RLS)
 * Only use for secure server-side admin operations that require bypassing RLS.
 *
 * This client:
 * - Has elevated privileges and bypasses all RLS policies
 * - Should only be used in secure server-side contexts
 * - Includes timeout protection for server requests
 * - Is cached for 5 minutes to prevent repeated creation
 *
 * Usage:
 * ```typescript
 * import { createServiceRoleClient } from '@/utils/supabase/server';
 *
 * const supabase = createServiceRoleClient();
 * const { data, error } = await supabase.from('table').select('*'); // Bypasses RLS
 * ```
 */
export function createServiceRoleClient<T = Database>() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error(
      "ERROR: Missing Supabase URL or Service Role Key for createServiceRoleClient. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    );
    throw new Error("Supabase service role client configuration error.");
  }

  // Check if we have a valid cached client
  const now = Date.now();
  if (
    serviceRoleClientCache &&
    now - serviceRoleClientCacheTime < SERVICE_ROLE_CLIENT_CACHE_TTL
  ) {
    // Return cached client without logging
    return serviceRoleClientCache;
  }

  // Only warn about service role usage when creating a new client
  console.warn(
    "[Supabase] Creating SERVICE ROLE client. Ensure this is ONLY for secure server-side admin operations.",
  );

  // Create new client
  const client = createSupabaseServerClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false, // Not needed for service role
      },
      cookies: {
        // Minimal cookie handler for service role, not used for auth state.
        getAll: () => [],
        setAll: () => {},
      },
      global: {
        fetch: createTimeoutFetch(10000), // 10-second timeout for server requests
        headers: {
          "X-Client-Info": "supabase-service-role/2.0.0",
        },
      },
    },
  );

  // Cache the client
  serviceRoleClientCache = client;
  serviceRoleClientCacheTime = now;

  return client;
}

// Export the Database type for convenience
export type { Database };
