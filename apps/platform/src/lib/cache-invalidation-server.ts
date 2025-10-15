/**
 * Server-side cache invalidation utilities for blog engagement system
 * This file contains server-only functions that use revalidateTag
 */

import "server-only";
import { revalidateTag } from "next/cache";

/**
 * Cache tags used throughout the application
 */
export const CACHE_TAGS = {
  BLOG_POSTS: "blog-posts",
  FEATURED: "featured",
  CATEGORIES: "categories",
  COMMENTS: "comments",
  ENGAGEMENT: "engagement",
} as const;

/**
 * Invalidate cache tags related to blog engagement
 */
export async function invalidateEngagementCache(slug?: string) {
  try {
    revalidateTag(CACHE_TAGS.BLOG_POSTS);
    revalidateTag(CACHE_TAGS.FEATURED);
    revalidateTag(CACHE_TAGS.ENGAGEMENT);

    if (slug) {
      revalidateTag(`blog-post-${slug}`);
      revalidateTag(`engagement-${slug}`);
    }

    console.log(
      `✅ [CacheInvalidation] Engagement cache invalidated${slug ? ` for ${slug}` : ""}`,
    );
    return true;
  } catch (error) {
    console.error(
      "[CacheInvalidation] Failed to invalidate engagement cache:",
      error,
    );
    return false;
  }
}

/**
 * Invalidate cache tags related to comments
 */
export async function invalidateCommentsCache(blogPostId?: string) {
  try {
    revalidateTag(CACHE_TAGS.BLOG_POSTS);
    revalidateTag(CACHE_TAGS.COMMENTS);
    revalidateTag(CACHE_TAGS.ENGAGEMENT);

    // Also invalidate the all-comments cache used by admin dashboard
    revalidateTag("all-comments");

    if (blogPostId) {
      revalidateTag(`comments-${blogPostId}`);
      revalidateTag(`engagement-${blogPostId}`);
    }

    console.log(
      `✅ [CacheInvalidation] Comments cache invalidated${blogPostId ? ` for ${blogPostId}` : ""}`,
    );
    return true;
  } catch (error) {
    console.error(
      "[CacheInvalidation] Failed to invalidate comments cache:",
      error,
    );
    return false;
  }
}

/**
 * Invalidate all blog-related cache tags
 */
export async function invalidateAllBlogCache() {
  try {
    revalidateTag(CACHE_TAGS.BLOG_POSTS);
    revalidateTag(CACHE_TAGS.FEATURED);
    revalidateTag(CACHE_TAGS.CATEGORIES);
    revalidateTag(CACHE_TAGS.COMMENTS);
    revalidateTag(CACHE_TAGS.ENGAGEMENT);

    console.log("✅ [CacheInvalidation] All blog cache invalidated");
    return true;
  } catch (error) {
    console.error(
      "[CacheInvalidation] Failed to invalidate all blog cache:",
      error,
    );
    return false;
  }
}

/**
 * Force invalidate individual blog post cache after engagement data fix
 */
export async function invalidateBlogPostCache(slug: string) {
  try {
    revalidateTag(CACHE_TAGS.BLOG_POSTS);
    revalidateTag(`blog-post-${slug}`);
    revalidateTag(`engagement-${slug}`);

    console.log(
      `✅ [CacheInvalidation] Blog post cache invalidated for ${slug}`,
    );
    return true;
  } catch (error) {
    console.error(
      `[CacheInvalidation] Failed to invalidate blog post cache for ${slug}:`,
      error,
    );
    return false;
  }
}

/**
 * Debounced cache invalidation to prevent excessive invalidations
 */
const invalidationTimeouts = new Map<string, NodeJS.Timeout>();

export function debouncedInvalidateEngagementCache(
  slug: string,
  delay: number = 1000,
) {
  const key = `engagement-${slug}`;

  // Clear existing timeout
  if (invalidationTimeouts.has(key)) {
    clearTimeout(invalidationTimeouts.get(key)!);
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    invalidateEngagementCache(slug);
    invalidationTimeouts.delete(key);
  }, delay);

  invalidationTimeouts.set(key, timeout);
}
