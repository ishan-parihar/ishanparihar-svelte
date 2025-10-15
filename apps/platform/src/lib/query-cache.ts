/**
 * Simple in-memory cache for database queries to reduce redundant requests
 * This provides request-level caching for blog data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get data from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Wrapper function to cache the result of an async function
   */
  async cached<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🎯 [Cache] Hit for key: ${key}`);
      }
      return cached;
    }

    // Not in cache, execute function and cache result
    if (process.env.NODE_ENV === "development") {
      console.log(`💾 [Cache] Miss for key: ${key}, executing function`);
    }

    try {
      const result = await fn();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }
}

// Create singleton instance
export const queryCache = new QueryCache();

// Convenience functions
export const getCached = <T>(key: string): T | null => queryCache.get<T>(key);
export const setCached = <T>(key: string, data: T, ttl?: number): void =>
  queryCache.set(key, data, ttl);
export const deleteCached = (key: string): boolean => queryCache.delete(key);
export const clearCache = (): void => queryCache.clear();

/**
 * Cache key generators for consistent cache keys
 */
export const cacheKeys = {
  blogPosts: () => "blog_posts_all",
  blogPost: (slug: string) => `blog_post_${slug}`,
  featuredPosts: (limit: number) => `featured_posts_${limit}`,
  blogCategories: () => "blog_categories",
  searchResults: (query: string) => `search_${query.toLowerCase().trim()}`,
  commentCounts: (postIds: string[]) =>
    `comment_counts_${postIds.sort().join(",")}`,
  engagement: (postIds: string[]) => `engagement_${postIds.sort().join(",")}`,
} as const;

/**
 * Cache wrapper for blog queries with automatic key generation
 */
export const withCache = {
  blogPosts: <T>(fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.blogPosts(), fn, ttl),

  blogPost: <T>(slug: string, fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.blogPost(slug), fn, ttl),

  featuredPosts: <T>(limit: number, fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.featuredPosts(limit), fn, ttl),

  categories: <T>(fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.blogCategories(), fn, ttl),

  search: <T>(query: string, fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.searchResults(query), fn, ttl),

  commentCounts: <T>(postIds: string[], fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.commentCounts(postIds), fn, ttl),

  engagement: <T>(postIds: string[], fn: () => Promise<T>, ttl?: number) =>
    queryCache.cached(cacheKeys.engagement(postIds), fn, ttl),
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  blogPosts: () => {
    deleteCached(cacheKeys.blogPosts());
    // Also clear featured posts cache as it depends on blog posts
    const stats = queryCache.getStats();
    stats.keys.forEach((key) => {
      if (key.startsWith("featured_posts_")) {
        deleteCached(key);
      }
    });
  },

  blogPost: (slug: string) => {
    deleteCached(cacheKeys.blogPost(slug));
    // Also invalidate blog posts list as it might include this post
    invalidateCache.blogPosts();
  },

  search: () => {
    const stats = queryCache.getStats();
    stats.keys.forEach((key) => {
      if (key.startsWith("search_")) {
        deleteCached(key);
      }
    });
  },

  engagement: (postIds?: string[]) => {
    if (postIds) {
      deleteCached(cacheKeys.engagement(postIds));
    } else {
      // Clear all engagement caches
      const stats = queryCache.getStats();
      stats.keys.forEach((key) => {
        if (key.startsWith("engagement_")) {
          deleteCached(key);
        }
      });
    }
  },

  all: () => clearCache(),
};

// Automatic cleanup every 10 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      queryCache.cleanup();
    },
    10 * 60 * 1000,
  );
}

// Export the main cache instance for advanced usage
export { queryCache as default };
