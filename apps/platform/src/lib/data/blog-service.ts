import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  createServerClient,
  createServiceRoleClient,
} from "@/utils/supabase/server";
import {
  saveBlogPost as saveSharedBlogPost,
  getBlogPostBySlug as getSharedBlogPostBySlug,
  getAllCategories as getSharedCategories,
} from "@/lib/supabase-shared";
import { getImagePublicUrl } from "@/lib/imageService";
import type { Database } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase-shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Modern Blog Data Service
 *
 * This service demonstrates the proper patterns for Supabase data access:
 * - Uses @supabase/ssr for proper client creation
 * - Implements caching with React.cache and unstable_cache
 * - Separates server and client logic
 * - Uses shared utilities that accept client instances
 */

/**
 * Create a cached Supabase client for server components
 * Uses React.cache to avoid creating multiple clients in the same render
 */
const createCachedServerClient = cache(async () => {
  console.log("[BlogService] Creating cached server component client");
  return await createServerClient();
});

/**
 * Cached function to get all published blog posts
 * Uses unstable_cache for cross-request caching
 */
export const getAllPublishedBlogPostsCached = unstable_cache(
  async (): Promise<BlogPost[]> => {
    console.log("[BlogService] Fetching all published blog posts (cached)");

    try {
      // Create client outside of the cached function to avoid cookies() issues
      const supabase = await createCachedServerClient();

      // Query for published posts with author details and engagement metrics
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:author_user_id(id, name, picture),
          blog_engagement!inner(claps_count, comments_count, views_count)
        `,
        )
        .eq("draft", false)
        .order("date", { ascending: false });

      if (error) {
        console.error("[BlogService] Error fetching blog posts:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Process cover images and engagement data
      const posts = data.map((post) => {
        // Process cover image
        if (post.cover_image) {
          const publicUrl = getImagePublicUrl(
            supabase,
            "blog-images",
            post.cover_image,
          );
          if (publicUrl) {
            post.cover_image = publicUrl;
          } else {
            post.cover_image = "/default-blog-image.jpg";
          }
        }

        // Process engagement data
        // Handle both array format (LEFT JOIN) and object format (INNER JOIN)
        if (post.blog_engagement) {
          let engagement;
          if (
            Array.isArray(post.blog_engagement) &&
            post.blog_engagement.length > 0
          ) {
            // Array format from LEFT JOIN
            engagement = post.blog_engagement[0];
          } else if (
            typeof post.blog_engagement === "object" &&
            !Array.isArray(post.blog_engagement)
          ) {
            // Object format from INNER JOIN
            engagement = post.blog_engagement;
          }

          if (engagement) {
            post.claps_count = engagement.claps_count || 0;
            post.comments_count = engagement.comments_count || 0;
            post.views_count = engagement.views_count || 0;
          } else {
            // Set default values if no engagement data
            post.claps_count = 0;
            post.comments_count = 0;
            post.views_count = 0;
          }
        } else {
          // Set default values if no engagement data
          post.claps_count = 0;
          post.comments_count = 0;
          post.views_count = 0;
        }

        return post as BlogPost;
      });

      return posts;
    } catch (error) {
      console.error(
        "[BlogService] Exception in getAllPublishedBlogPostsCached:",
        error,
      );
      return [];
    }
  },
  ["blog-posts-published"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["blog-posts"],
  },
);

/**
 * Cached function to get a blog post by slug
 * Uses React.cache for request-level memoization
 */
export const getBlogPostBySlugCached = cache(
  async (slug: string): Promise<BlogPost | null> => {
    console.log(`[BlogService] Fetching blog post by slug: ${slug} (cached)`);

    try {
      const supabase = await createCachedServerClient();
      return await getSharedBlogPostBySlug(supabase, slug, false);
    } catch (error) {
      console.error(`[BlogService] Error fetching blog post ${slug}:`, error);
      return null;
    }
  },
);

/**
 * Cached function to get all categories
 * Uses unstable_cache for cross-request caching
 */
export const getAllCategoriesCached = unstable_cache(
  async (): Promise<string[]> => {
    console.log("[BlogService] Fetching all categories (cached)");

    try {
      const supabase = await createCachedServerClient();
      return await getSharedCategories(supabase);
    } catch (error) {
      console.error("[BlogService] Error fetching categories:", error);
      return ["Personal Growth"];
    }
  },
  ["blog-categories"],
  {
    revalidate: 7200, // Revalidate every 2 hours
    tags: ["blog-posts", "categories"],
  },
);

/**
 * Save a blog post (admin operation)
 * Uses service role client to bypass RLS
 */
export async function saveBlogPostAdmin(post: BlogPost): Promise<boolean> {
  console.log("[BlogService] Saving blog post (admin)");

  try {
    const supabase = createServiceRoleClient();
    const success = await saveSharedBlogPost(supabase, post);

    if (success) {
      // Revalidate cache tags
      const { revalidateTag } = await import("next/cache");
      revalidateTag("blog-posts");
      revalidateTag("categories");
      if (post.featured) {
        revalidateTag("featured");
      }
    }

    return success;
  } catch (error) {
    console.error("[BlogService] Error saving blog post:", error);
    return false;
  }
}

/**
 * Delete a blog post (admin operation)
 * Uses service role client to bypass RLS
 */
export async function deleteBlogPostAdmin(slug: string): Promise<boolean> {
  console.log(`[BlogService] Deleting blog post: ${slug} (admin)`);

  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("slug", slug);

    const success = !error;

    if (success) {
      // Revalidate cache tags
      const { revalidateTag } = await import("next/cache");
      revalidateTag("blog-posts");
      revalidateTag("categories");
      revalidateTag("featured");
    } else {
      console.error(`[BlogService] Error deleting blog post ${slug}:`, error);
    }

    return success;
  } catch (error) {
    console.error(`[BlogService] Exception deleting blog post ${slug}:`, error);
    return false;
  }
}

/**
 * Search blog posts
 * Uses server component client with RLS
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  console.log(`[BlogService] Searching blog posts for: ${query}`);

  if (!query || query.trim() === "") {
    return [];
  }

  try {
    const supabase = await createCachedServerClient();
    const normalizedQuery = query.toLowerCase().trim();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:author_user_id(id, name, email, picture, role),
        blog_engagement!inner(claps_count, comments_count, views_count)
      `,
      )
      .or(
        `title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%,excerpt.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`,
      )
      .eq("draft", false)
      .order("date", { ascending: false });

    if (error) {
      console.error("[BlogService] Error searching blog posts:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Process cover images and engagement data
    const posts = data.map((post) => {
      // Process cover image
      if (post.cover_image) {
        const publicUrl = getImagePublicUrl(
          supabase,
          "blog-images",
          post.cover_image,
        );
        if (publicUrl) {
          post.cover_image = publicUrl;
        } else {
          post.cover_image = "/default-blog-image.jpg";
        }
      }

      // Process engagement data
      // Handle both array format (LEFT JOIN) and object format (INNER JOIN)
      if (post.blog_engagement) {
        let engagement;
        if (
          Array.isArray(post.blog_engagement) &&
          post.blog_engagement.length > 0
        ) {
          // Array format from LEFT JOIN
          engagement = post.blog_engagement[0];
        } else if (
          typeof post.blog_engagement === "object" &&
          !Array.isArray(post.blog_engagement)
        ) {
          // Object format from INNER JOIN
          engagement = post.blog_engagement;
        }

        if (engagement) {
          post.claps_count = engagement.claps_count || 0;
          post.comments_count = engagement.comments_count || 0;
          post.views_count = engagement.views_count || 0;
        } else {
          // Set default values if no engagement data
          post.claps_count = 0;
          post.comments_count = 0;
          post.views_count = 0;
        }
      } else {
        // Set default values if no engagement data
        post.claps_count = 0;
        post.comments_count = 0;
        post.views_count = 0;
      }

      return post as BlogPost;
    });

    return posts;
  } catch (error) {
    console.error(`[BlogService] Exception searching blog posts:`, error);
    return [];
  }
}

/**
 * Client-side blog post fetching utility
 * For use in client components
 */
export async function getBlogPostBySlugClient(
  slug: string,
): Promise<BlogPost | null> {
  console.log(`[BlogService] Fetching blog post by slug (client): ${slug}`);

  try {
    // Import client factory - this function should only be called from client components
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();

    return await getSharedBlogPostBySlug(supabase, slug, false);
  } catch (error) {
    console.error(
      `[BlogService] Error fetching blog post ${slug} (client):`,
      error,
    );
    return null;
  }
}
