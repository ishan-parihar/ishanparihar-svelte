/**
 * Client-side cache invalidation utilities for blog engagement system
 * Provides centralized cache management for real-time data updates
 * This file contains only client-side functions and does not import server-only modules
 */

/**
 * Client-side cache invalidation event dispatcher
 * Use this to notify client components of data changes
 * Enhanced to support comprehensive engagement synchronization
 */
export function dispatchEngagementUpdate(data: {
  slug: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  type?: "like" | "comment" | "view";
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("engagement-updated", {
        detail: {
          slug: data.slug,
          likes_count: data.likes_count,
          comments_count: data.comments_count,
          views_count: data.views_count,
          type: data.type,
          timestamp: Date.now(),
        },
      }),
    );

    console.log(
      `📡 [CacheInvalidation] Dispatched engagement update for ${data.slug}:`,
      data,
    );
  }
}

/**
 * Enhanced engagement update dispatcher for API routes
 * Call this from API routes after successful engagement updates
 */
export function dispatchServerEngagementUpdate(data: {
  slug: string;
  claps_count: number;
  comments_count: number;
  views_count: number;
  type: "clap" | "comment" | "view";
}) {
  // For server-side, we'll rely on the client-side hooks to handle the synchronization
  // This function is here for consistency and future server-side event handling
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🔄 [ServerEngagement] Updated engagement for ${data.slug}:`,
      data,
    );
  }
}

/**
 * Client-side data refresh utility
 * Forces components to refetch data
 */
export function triggerDataRefresh(
  type: "blog-posts" | "engagement" | "comments" = "blog-posts",
) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("data-refresh", {
        detail: {
          type,
          timestamp: Date.now(),
        },
      }),
    );

    console.log(`🔄 [CacheInvalidation] Triggered data refresh for ${type}`);
  }
}

/**
 * Debounced engagement update dispatcher to prevent excessive updates
 */
const invalidationTimeouts = new Map<string, NodeJS.Timeout>();

export function debouncedDispatchEngagementUpdate(
  data: {
    slug: string;
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    type?: "like" | "comment" | "view";
  },
  delay = 1000,
) {
  const key = `engagement-${data.slug}`;

  // Clear existing timeout
  if (invalidationTimeouts.has(key)) {
    clearTimeout(invalidationTimeouts.get(key)!);
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    dispatchEngagementUpdate(data);
    invalidationTimeouts.delete(key);
  }, delay);

  invalidationTimeouts.set(key, timeout);
}

/**
 * Cleanup function for debounced invalidations
 */
export function cleanupInvalidationTimeouts() {
  invalidationTimeouts.forEach((timeout) => clearTimeout(timeout));
  invalidationTimeouts.clear();
}
