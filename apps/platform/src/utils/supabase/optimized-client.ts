"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/supabase";

// Singleton pattern for Supabase client to avoid multiple instances
let supabaseClient: any | null = null;

/**
 * Optimized Supabase client factory with singleton pattern
 * This reduces memory usage and improves performance by reusing the same client instance
 */
export function getOptimizedSupabaseClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Validate environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "ERROR: Missing Supabase URL or Anon Key for browser client.",
    );
    throw new Error("Supabase browser client configuration error.");
  }

  // Create new client with optimized configuration
  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "X-Client-Info": "supabase-optimized-client/3.0.0",
          Connection: "keep-alive", // Reuse connections for better performance
          "Keep-Alive": "timeout=30, max=100",
          "Accept-Encoding": "gzip, deflate, br", // Enable compression
        },
        // Enhanced fetch with better error handling and performance
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          return fetch(url, {
            ...options,
            signal: controller.signal,
            keepalive: true, // Enable HTTP/2 multiplexing
          }).finally(() => clearTimeout(timeoutId));
        },
      },
      // Optimize connection pooling
      db: {
        schema: "public",
      },
    },
  );

  return supabaseClient;
}

/**
 * Reset the singleton client (useful for testing or auth state changes)
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}

/**
 * Lightweight client factory for specific operations
 * Use this when you need a fresh client instance
 */
export function createLightweightSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase configuration error.");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false, // Minimal auth handling
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}

// Cache for frequently accessed data
const queryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

/**
 * Cached query wrapper for frequently accessed data
 * Reduces database calls and improves performance
 */
export function getCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  const cached = queryCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < cached.ttl) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache Hit] ${key}`);
    }
    return Promise.resolve(cached.data);
  }

  return queryFn().then((data) => {
    queryCache.set(key, { data, timestamp: now, ttl });
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache Miss] ${key} - cached for ${ttl}ms`);
    }
    return data;
  });
}

/**
 * Clear cache utility
 */
export function clearQueryCache(pattern?: string) {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache Cleared] ${pattern || "all"}`);
  }
}

// Export the Database type for convenience
export type { Database };
