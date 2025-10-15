import "server-only";
import { cache } from "react";
import {
  getPublicBlogPosts,
  getBlogPostBySlug,
  getFeaturedBlogPosts,
  type PublicBlogPost,
} from "@/queries/blogQueries";
import { createServiceRoleClient } from "@/utils/supabase/server";
import type { BlogPost } from "./supabase-shared";

/**
 * Helper function to convert PublicBlogPost to BlogPost
 */
function convertToLegacyBlogPost(post: PublicBlogPost): BlogPost {
  return {
    ...post,
    author:
      typeof post.author === "string"
        ? post.author
        : typeof post.author === "object" &&
            post.author &&
            "name" in post.author
          ? (post.author as any).name
          : "Anonymous",
    // BlogPost type uses cover_image, not coverImage
    cover_image: post.cover_image || "",
    // Ensure new metadata fields are included
    content_type: post.content_type || "blog",
    recommendation_tags: post.recommendation_tags || [],
  };
}

/**
 * Gets a blog post by its slug, utilizing React.cache for memoization
 * within the same render pass.
 *
 * This function returns a blog post by slug, with request-level memoization.
 * It's wrapped in React.cache to ensure that if getBlogPost(slug) is called multiple times
 * with the same slug in the same render pass, the underlying fetch only happens once.
 *
 * @param slug The slug of the blog post to get
 * @returns The blog post or null if not found
 */
export const getBlogPost = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    const startTime = performance.now();

    if (DEBUG_MODE) {
      console.log(
        `[BlogPreload] Getting blog post with slug "${slug}" (React.cache wrapper)`,
      );
    }

    const supabase = createServiceRoleClient();
    const post = await getBlogPostBySlug(supabase, slug);

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (DEBUG_MODE) {
      console.log(
        `[BlogPreload] Fetched blog post "${slug}" in ${duration.toFixed(2)}ms`,
      );
    }

    return post ? convertToLegacyBlogPost(post) : null;
  },
);

/**
 * Preloads a blog post by its slug.
 *
 * This function initiates the data fetch for a blog post but doesn't return the data.
 * It's meant to be called before the actual data is needed, e.g., on hover of a link,
 * or in parent Server Components to warm up the cache.
 *
 * @param slug The slug of the blog post to preload
 */
export const preloadBlogPost = (slug: string): void => {
  // This function is called to initiate the fetch.
  // It doesn't return the data directly but ensures the cache is populated.
  void getBlogPost(slug);
};

/**
 * Get all published blog posts with React.cache memoization
 *
 * This function returns all published blog posts with request-level memoization.
 * It's wrapped in React.cache to ensure that if getAllBlogPosts() is called multiple times
 * in the same render pass, the underlying fetch only happens once.
 *
 * @returns Array of published blog posts
 */
export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" && process.env.BLOG_DEBUG === "true";
  const startTime = performance.now();

  if (DEBUG_MODE) {
    console.log(
      `[BlogPreload] Getting all published blog posts (React.cache wrapper)`,
    );
  }

  const supabase = createServiceRoleClient();
  const posts = await getPublicBlogPosts(supabase);

  const endTime = performance.now();
  const duration = endTime - startTime;

  if (DEBUG_MODE) {
    console.log(
      `[BlogPreload] Fetched ${posts.length} blog posts in ${duration.toFixed(2)}ms`,
    );
  }

  return posts.map(convertToLegacyBlogPost);
});

/**
 * Preload all published blog posts
 *
 * This function initiates the data fetch for all published blog posts but doesn't return the data.
 * It's meant to be called before the actual data is needed, e.g., when navigating to the blog page.
 */
export const preloadAllPublishedBlogPosts = (): void => {
  // This function is called to initiate the fetch.
  // It doesn't return the data directly but ensures the cache is populated.
  void getAllBlogPosts();
};

/**
 * Get multiple featured blog posts with React.cache memoization
 *
 * This function returns multiple featured blog posts with request-level memoization.
 * It's wrapped in React.cache to ensure that if getFeaturedPosts() is called multiple times
 * in the same render pass, the underlying fetch only happens once.
 *
 * @param limit Number of featured posts to return (default: 5)
 * @returns Array of featured blog posts
 */
export const getFeaturedPosts = cache(
  async (limit: number = 5): Promise<BlogPost[]> => {
    console.log(
      `[BlogPreload] Getting ${limit} featured blog posts (React.cache wrapper)`,
    );
    const supabase = createServiceRoleClient();
    const posts = await getFeaturedBlogPosts(supabase, limit);
    return posts.map(convertToLegacyBlogPost);
  },
);

/**
 * Preload multiple featured blog posts
 *
 * This function initiates the data fetch for multiple featured blog posts but doesn't return the data.
 * It's meant to be called before the actual data is needed, e.g., when navigating to the blog page.
 *
 * @param limit Number of featured posts to preload (default: 5)
 */
export const preloadFeaturedBlogPosts = (limit: number = 5): void => {
  // This function is called to initiate the fetch.
  // It doesn't return the data directly but ensures the cache is populated.
  void getFeaturedPosts(limit);
};
