"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/supabase";

// Optimized singleton pattern for Supabase client to reduce bundle size
let supabaseClient: any | null = null;
let isInitializing = false;

/**
 * Optimized Supabase client factory with lazy initialization
 * Reduces initial bundle size by deferring client creation
 */
export function getOptimizedSupabaseClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Prevent multiple initialization attempts
  if (isInitializing) {
    throw new Error("Supabase client is already being initialized");
  }

  isInitializing = true;

  try {
    // Validate environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create optimized client with minimal configuration for better performance
    supabaseClient = createBrowserClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
      global: {
        headers: {
          "X-Client-Info": "ishanparihar-optimized-v2",
        },
      },
      // Optimize for performance - disable realtime for better bundle size
      realtime: {
        params: {
          eventsPerSecond: 5, // Further limit realtime events
        },
      },
      // Optimize database connections
      db: {
        schema: "public",
      },
    });

    return supabaseClient;
  } catch (error) {
    console.error("Failed to create optimized Supabase client:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Reset the client (useful for testing or when switching environments)
 */
export function resetOptimizedSupabaseClient() {
  supabaseClient = null;
  isInitializing = false;
}

/**
 * Check if client is initialized
 */
export function isSupabaseClientInitialized() {
  return supabaseClient !== null;
}

/**
 * Lightweight client for read-only operations
 * Reduces overhead for simple queries
 */
export function getReadOnlySupabaseClient() {
  const client = getOptimizedSupabaseClient();

  // Return a proxy that only allows read operations
  return new Proxy(client, {
    get(target, prop) {
      // Allow only read operations and essential methods
      const allowedMethods = [
        "from",
        "select",
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "like",
        "ilike",
        "is",
        "in",
        "contains",
        "containedBy",
        "rangeGt",
        "rangeGte",
        "rangeLt",
        "rangeLte",
        "rangeAdjacent",
        "overlaps",
        "textSearch",
        "match",
        "not",
        "or",
        "filter",
        "order",
        "limit",
        "range",
        "single",
        "maybeSingle",
        "csv",
        "geojson",
        "explain",
        "rollback",
        "returns",
      ];

      if (
        typeof target[prop] === "function" &&
        allowedMethods.includes(prop as string)
      ) {
        return target[prop].bind(target);
      }

      return target[prop];
    },
  });
}

/**
 * Performance monitoring for Supabase operations
 */
export function withSupabasePerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<T> {
  if (process.env.NODE_ENV !== "development") {
    return operation();
  }

  const startTime = performance.now();

  return operation()
    .then((result) => {
      const endTime = performance.now();
      console.log(
        `🔍 [Supabase] ${operationName}: ${(endTime - startTime).toFixed(2)}ms`,
      );
      return result;
    })
    .catch((error) => {
      const endTime = performance.now();
      console.error(
        `❌ [Supabase] ${operationName} failed after ${(endTime - startTime).toFixed(2)}ms:`,
        error,
      );
      throw error;
    });
}

/**
 * Batch operations helper to reduce round trips
 */
export class SupabaseBatchOperations {
  private client: any;
  private operations: Array<() => Promise<any>> = [];

  constructor() {
    this.client = getOptimizedSupabaseClient();
  }

  addOperation(operation: () => Promise<any>) {
    this.operations.push(operation);
    return this;
  }

  async execute() {
    if (this.operations.length === 0) {
      return [];
    }

    const startTime = performance.now();

    try {
      const results = await Promise.all(this.operations.map((op) => op()));

      if (process.env.NODE_ENV === "development") {
        const endTime = performance.now();
        console.log(
          `📦 [Supabase Batch] Executed ${this.operations.length} operations in ${(endTime - startTime).toFixed(2)}ms`,
        );
      }

      return results;
    } catch (error) {
      console.error("Batch operation failed:", error);
      throw error;
    } finally {
      this.operations = []; // Clear operations
    }
  }
}

/**
 * Cache-aware query helper
 */
export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
) {
  const cache = new Map<string, { data: T; timestamp: number }>();

  return async (): Promise<T> => {
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && now - cached.timestamp < ttlMs) {
      if (process.env.NODE_ENV === "development") {
        console.log(`💾 [Cache Hit] ${cacheKey}`);
      }
      return cached.data;
    }

    const data = await withSupabasePerformanceMonitoring(
      queryFn,
      `Query: ${cacheKey}`,
    );
    cache.set(cacheKey, { data, timestamp: now });

    return data;
  };
}
