import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase";
import {
  useQuery as useReactQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useQuery as useSupabaseQuery,
  prefetchQuery as supabasePrefetchQuery,
  useUpsertMutation,
  useDeleteMutation,
} from "@supabase-cache-helpers/postgrest-react-query";
import { getBlogPostsEngagementClient } from "@/lib/engagement-client";
import { generateSEOSlug } from "@/lib/slug-utils";
import { performanceMonitor } from "@/lib/performance-monitor";
import { withCache } from "@/lib/query-cache";

// Re-export prefetchQuery for convenience
export { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

// Type for the blog post data we'll fetch
export type PublicBlogPost = Omit<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  "author"
> & {
  // Author field as string (display name)
  author?: string;
  // Author details object with structured information
  author_details?: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  } | null;
  // Extended fields that might be joined from other tables
  blog_engagement?: {
    likes_count: number;
    views_count: number;
  } | null;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  // New metadata fields
  content_type: "blog" | "research_paper";
  recommendation_tags: string[];
};

// Type for blog post save operations
export type BlogPostSaveData = {
  slug?: string;
  originalSlug?: string; // Used for handling slug changes during updates
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  coverImage?: string; // Legacy support
  date: string;
  author: string;
  author_user_id?: string;
  category: string;
  featured: boolean;
  draft?: boolean;
  premium?: boolean;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
};

/**
 * Query key factory for blog-related queries
 * This helps with cache invalidation and organization
 * Updated to ensure consistent cache invalidation across all blog queries
 */
export const blogQueryKeys = {
  all: ["blog"] as const,
  posts: () => [...blogQueryKeys.all, "posts"] as const,
  publicPosts: () => [...blogQueryKeys.posts(), "public"] as const,
  publicPostsWithLimit: (limit: number) =>
    [...blogQueryKeys.posts(), "public", "limit", limit] as const,
  featuredPosts: () => [...blogQueryKeys.posts(), "featured"] as const,
  post: (slug: string) => [...blogQueryKeys.posts(), "detail", slug] as const,
  engagement: (slug: string) =>
    [...blogQueryKeys.all, "engagement", slug] as const,
  categories: () => [...blogQueryKeys.all, "categories"] as const,
  search: (query: string) => [...blogQueryKeys.all, "search", query] as const,

  // Helper methods for cache invalidation
  allPosts: () => [...blogQueryKeys.posts()] as const,
  allEngagement: () => [...blogQueryKeys.all, "engagement"] as const,
} as const;

// ============================================================================
// MANUAL ENGAGEMENT JOIN UTILITIES
// ============================================================================

/**
 * Optimized function to fetch comment counts for multiple blog posts in a single query
 * This eliminates the N+1 query pattern
 */
async function fetchCommentCounts(
  supabase: SupabaseClient<Database>,
  postIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("blog_post_id")
      .in("blog_post_id", postIds)
      .eq("is_approved", true)
      .eq("is_deleted", false);

    if (error) {
      console.error("[BlogQueries] Error fetching comment counts:", error);
      return {};
    }

    // Count comments per post
    const commentCounts: Record<string, number> = {};
    postIds.forEach((postId) => {
      commentCounts[postId] = 0;
    });

    if (data) {
      data.forEach((comment) => {
        commentCounts[comment.blog_post_id] =
          (commentCounts[comment.blog_post_id] || 0) + 1;
      });
    }

    return commentCounts;
  } catch (error) {
    console.error("[BlogQueries] Exception fetching comment counts:", error);
    return {};
  }
}

/**
 * Optimized function to fetch engagement data and comment counts in parallel
 * This replaces the broken Supabase JOIN syntax with efficient parallel queries
 */
async function fetchBlogPostsWithEngagement(
  supabase: SupabaseClient<Database>,
  posts: any[],
): Promise<PublicBlogPost[]> {
  if (!posts || posts.length === 0) {
    return [];
  }

  try {
    // Get blog post IDs
    const postIds = posts.map((post) => post.id).filter(Boolean);

    if (postIds.length === 0) {
      return posts.map((post) => ({
        ...post,
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
      }));
    }

    // Fetch engagement data and comment counts in parallel to improve performance
    const [engagementData, commentCounts] = await Promise.all([
      getBlogPostsEngagementClient(supabase, postIds),
      fetchCommentCounts(supabase, postIds),
    ]);

    // Merge engagement data with posts
    return posts.map((post) => {
      const engagement = engagementData[post.id];
      const commentsCount = commentCounts[post.id] || 0;

      return {
        ...post,
        likes_count: engagement?.likes_count || 0,
        comments_count: commentsCount, // Use optimized comment count
        views_count: engagement?.views_count || 0,
      };
    });
  } catch (error) {
    console.error("[BlogQueries] Error fetching engagement data:", error);
    // Return posts with default engagement values on error
    return posts.map((post) => ({
      ...post,
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
    }));
  }
}

/**
 * Optimized function to fetch engagement data for a single blog post
 * Uses parallel queries to improve performance
 */
async function fetchBlogPostWithEngagement(
  supabase: SupabaseClient<Database>,
  post: any,
): Promise<PublicBlogPost> {
  if (!post) {
    return post;
  }

  try {
    // Fetch engagement data and comment count in parallel
    const [engagementData, commentCounts] = await Promise.all([
      getBlogPostsEngagementClient(supabase, [post.id]),
      fetchCommentCounts(supabase, [post.id]),
    ]);

    const engagement = engagementData[post.id];
    const commentsCount = commentCounts[post.id] || 0;

    return {
      ...post,
      likes_count: engagement?.likes_count || 0,
      comments_count: commentsCount, // Use optimized comment count
      views_count: engagement?.views_count || 0,
    };
  } catch (error) {
    console.error(
      "[BlogQueries] Error fetching engagement data for single post:",
      error,
    );
    // Return post with default engagement values on error
    return {
      ...post,
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
    };
  }
}

/**
 * Fetches all public (published) blog posts
 * Matches the logic from the existing server-side functions
 */
export async function getPublicBlogPosts(
  supabase: SupabaseClient<Database>,
  limit?: number,
): Promise<PublicBlogPost[]> {
  return withCache.blogPosts(
    async () => {
      return performanceMonitor.measure(
        "getPublicBlogPosts",
        async () => {
          const DEBUG_MODE =
            process.env.NODE_ENV === "development" &&
            process.env.BLOG_DEBUG === "true";

          if (DEBUG_MODE) {
            console.log("[BlogQueries] Fetching public blog posts...");
          }

          let query = supabase
            .from("blog_posts")
            .select(
              `
        id,
        slug,
        title,
        excerpt,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
            )
            .eq("draft", false) // Only published posts
            .order("date", { ascending: false });

          // Apply limit if provided
          if (limit && limit > 0) {
            query = query.limit(limit);
          }

          const { data, error } = await query;

          if (error) {
            console.error(
              "[BlogQueries] Error fetching public blog posts:",
              error,
            );
            throw new Error(`Failed to fetch blog posts: ${error.message}`);
          }

          if (!data) {
            if (DEBUG_MODE) {
              console.log("[BlogQueries] No blog posts found");
            }
            return [];
          }

          // Transform the data to match our expected format
          const transformedData = data.map((post: any) => {
            // Handle author data transformation
            let authorName = "Anonymous";
            let authorDetails = null;

            if (post.author && typeof post.author === "object") {
              authorName = post.author.name || "Anonymous";
              authorDetails = {
                id: post.author.id || "",
                display_name: authorName,
                profile_picture_url: post.author.picture || null,
                role: "author", // Default role since we don't select role field
              };
            } else if (typeof post.author === "string") {
              authorName = post.author;
            }

            return {
              ...post,
              author: authorName,
              author_details: authorDetails,
            };
          });

          // Use manual engagement join to get real engagement data
          const postsWithEngagement = await fetchBlogPostsWithEngagement(
            supabase,
            transformedData,
          );

          if (DEBUG_MODE) {
            console.log(
              `[BlogQueries] Successfully fetched ${postsWithEngagement.length} public blog posts with engagement data`,
            );
          }
          return postsWithEngagement;
        },
        { postCount: 0 },
      ); // Will be updated with actual count
    },
    5 * 60 * 1000,
  ); // Cache for 5 minutes
}

/**
 * Helper function to calculate engagement score
 * Score = (Likes × 3) + (Views × 0.1)
 */
function calculateEngagementScore(
  likes_count: number,
  views_count: number,
): number {
  return likes_count * 3 + views_count * 0.1;
}

/**
 * Fetches featured blog posts ordered by engagement score
 * This ensures the most engaging featured posts appear in the sidebar
 */
export async function getFeaturedBlogPosts(
  supabase: SupabaseClient<Database>,
  limit: number = 5,
): Promise<PublicBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Fetching ${limit} featured blog posts ordered by engagement score...`,
      );
    }

    // Fetch more featured posts than needed for better score-based selection
    const fetchLimit = Math.max(limit * 2, 10); // Fetch at least 10 or double the limit

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
      )
      .eq("draft", false)
      .eq("featured", true)
      .order("date", { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error("[BlogQueries] Error fetching featured blog posts:", error);
      throw new Error(`Failed to fetch featured blog posts: ${error.message}`);
    }

    if (!data || data.length === 0) {
      if (DEBUG_MODE) {
        console.log("[BlogQueries] No featured blog posts found");
      }
      return [];
    }

    // Transform the data to match our expected format
    const transformedData = data.map((post: any) => {
      // Handle author data transformation
      let authorName = "Anonymous";
      let authorDetails = null;

      if (post.author && typeof post.author === "object") {
        authorName = post.author.name || "Anonymous";
        authorDetails = {
          id: post.author.id || "",
          display_name: authorName,
          profile_picture_url: post.author.picture || null,
          role: "author", // Default role since we don't select role field
        };
      } else if (typeof post.author === "string") {
        authorName = post.author;
      }

      return {
        ...post,
        author: authorName,
        author_details: authorDetails,
      };
    });

    // Use manual engagement join to get real engagement data
    const postsWithEngagement = await fetchBlogPostsWithEngagement(
      supabase,
      transformedData,
    );

    // Calculate engagement scores and sort by score (highest first)
    const postsWithScores = postsWithEngagement.map((post) => ({
      ...post,
      engagement_score: calculateEngagementScore(
        post.likes_count || 0,
        post.views_count || 0,
      ),
    }));

    // Sort by engagement score (highest first), then by date as fallback
    const sortedPosts = postsWithScores.sort((a, b) => {
      if (b.engagement_score !== a.engagement_score) {
        return b.engagement_score - a.engagement_score;
      }
      // Fallback to date if scores are equal
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Take only the requested number of posts
    const finalPosts = sortedPosts.slice(0, limit);

    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Successfully fetched ${finalPosts.length} featured blog posts ordered by engagement score`,
      );
      console.log(
        `[BlogQueries] Top featured posts scores:`,
        finalPosts.map((p) => ({
          title: p.title,
          score: p.engagement_score,
          likes: p.likes_count,
          views: p.views_count,
        })),
      );
    }

    return finalPosts;
  } catch (error) {
    console.error(
      "[BlogQueries] Unexpected error in getFeaturedBlogPosts:",
      error,
    );
    throw error;
  }
}

/**
 * Fetches a single blog post by slug
 */
export async function getBlogPostBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PublicBlogPost | null> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(`[BlogQueries] Fetching blog post with slug: ${slug}`);
    }

    // Fetch with author join, selecting only public fields from users table
    // The new RLS policy should allow access to basic author info for published posts
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:author_user_id(id, name, picture)
      `,
      )
      .eq("slug", slug)
      .eq("draft", false)
      .maybeSingle();

    if (error) {
      console.error(
        `[BlogQueries] Error fetching blog post with slug ${slug}:`,
        error,
      );
      throw new Error(`Failed to fetch blog post: ${error.message}`);
    }

    if (!data) {
      if (DEBUG_MODE) {
        console.log(`[BlogQueries] No blog post found with slug: ${slug}`);
      }
      return null;
    }

    // Transform the data to match our expected format
    // Handle author data transformation
    let authorName = "Anonymous";
    let authorDetails = null;

    if (data.author && typeof data.author === "object") {
      authorName = data.author.name || "Anonymous";
      authorDetails = {
        id: data.author.id || "",
        display_name: authorName,
        profile_picture_url: data.author.picture || null,
        role: "author", // Default role since we don't select role field
      };
    } else if (typeof data.author === "string") {
      authorName = data.author;
    }

    const transformedData = {
      ...data,
      author: authorName,
      author_details: authorDetails,
    };

    // Use manual engagement join to get real engagement data
    const postWithEngagement = await fetchBlogPostWithEngagement(
      supabase,
      transformedData,
    );

    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Successfully fetched blog post: ${data.title} with author: ${data.author?.name || "Anonymous"} and engagement data`,
      );
    }
    return postWithEngagement;
  } catch (error) {
    console.error(
      `[BlogQueries] Unexpected error in getBlogPostBySlug for ${slug}:`,
      error,
    );
    throw error;
  }
}

/**
 * Fetches all categories from blog posts
 */
export async function getBlogCategories(
  supabase: SupabaseClient<Database>,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("draft", false);

    if (error) {
      console.error("[BlogQueries] Error fetching categories:", error);
      return ["Personal Growth"]; // Fallback
    }

    if (!data || data.length === 0) {
      return ["Personal Growth"]; // Fallback
    }

    // Extract unique categories and filter out empty ones
    const categories = [
      ...new Set(
        data
          .map((post) => post.category)
          .filter((category) => category && category.trim() !== ""),
      ),
    ].sort();

    return categories;
  } catch (error) {
    console.error("[BlogQueries] Error fetching categories:", error);
    return ["Personal Growth"]; // Fallback
  }
}

/**
 * Searches blog posts by query string
 */
export async function searchBlogPosts(
  supabase: SupabaseClient<Database>,
  query: string,
): Promise<PublicBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(`[BlogQueries] Searching blog posts for: "${query}"`);
    }

    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      // Return all posts if query is empty
      return getPublicBlogPosts(supabase);
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        content,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
      )
      .or(
        `title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%,excerpt.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`,
      )
      .eq("draft", false)
      .order("date", { ascending: false });

    if (error) {
      console.error("[BlogQueries] Error searching blog posts:", error);
      throw error;
    }

    if (!data) {
      if (DEBUG_MODE) {
        console.log(`[BlogQueries] No posts found matching "${query}"`);
      }
      return [];
    }

    // Transform the data to match our expected format
    const transformedData = data.map((post: any) => {
      // Handle author data transformation
      let authorName = "Anonymous";
      let authorDetails = null;

      if (post.author && typeof post.author === "object") {
        authorName = post.author.name || "Anonymous";
        authorDetails = {
          id: post.author.id || "",
          display_name: authorName,
          profile_picture_url: post.author.picture || null,
          role: "author", // Default role since we don't select role field
        };
      } else if (typeof post.author === "string") {
        authorName = post.author;
      }

      return {
        ...post,
        author: authorName,
        author_details: authorDetails,
      };
    });

    // Use manual engagement join to get real engagement data
    const postsWithEngagement = await fetchBlogPostsWithEngagement(
      supabase,
      transformedData,
    );

    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Found ${postsWithEngagement.length} posts matching "${query}" with engagement data`,
      );
    }

    return postsWithEngagement;
  } catch (error) {
    console.error("[BlogQueries] Error searching blog posts:", error);
    throw error;
  }
}

/**
 * Saves a blog post (create or update)
 * This function should be used with React Query mutations
 */
export async function saveBlogPost(
  supabase: SupabaseClient<Database>,
  postData: BlogPostSaveData,
): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[BlogQueries] Saving blog post:", postData.title);
    }

    // Normalize cover image field
    const cover_image = postData.cover_image || postData.coverImage || "";

    // Prepare the data for Supabase
    const supabaseData = {
      slug: postData.slug,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      cover_image,
      date: postData.date,
      author: postData.author,
      author_user_id: postData.author_user_id,
      category: postData.category,
      featured: postData.featured,
      draft: postData.draft || false,
      premium: postData.premium || false,
      content_type: postData.content_type || "blog",
      recommendation_tags: postData.recommendation_tags || [],
    };

    let result;
    if (postData.slug && postData.originalSlug) {
      // Update existing post - handle potential slug change
      const isSlugChanged = postData.slug !== postData.originalSlug;

      if (isSlugChanged) {
        if (DEBUG_MODE) {
          console.log(
            `[BlogQueries] Updating post with slug change: "${postData.originalSlug}" -> "${postData.slug}"`,
          );
        }

        // Check if new slug already exists (to avoid conflicts)
        const { data: existingPost } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("slug", postData.slug)
          .maybeSingle();

        if (existingPost) {
          console.error(
            `[BlogQueries] Slug conflict: "${postData.slug}" already exists`,
          );
          return {
            success: false,
            error: `URL slug "${postData.slug}" already exists. Please modify the title to generate a unique URL.`,
          };
        }

        // Update with new slug
        supabaseData.slug = postData.slug;
      }

      // Update using original slug to find the record
      result = await supabase
        .from("blog_posts")
        .update(supabaseData)
        .eq("slug", postData.originalSlug)
        .select()
        .single();
    } else if (postData.slug) {
      // Update existing post (legacy path - no originalSlug provided)
      result = await supabase
        .from("blog_posts")
        .update(supabaseData)
        .eq("slug", postData.slug)
        .select()
        .single();
    } else {
      // Create new post - generate slug if not provided
      if (!supabaseData.slug) {
        supabaseData.slug = generateSEOSlug(postData.title);
      }

      result = await supabase
        .from("blog_posts")
        .insert(supabaseData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("[BlogQueries] Error saving blog post:", result.error);
      return { success: false, error: result.error.message };
    }

    if (DEBUG_MODE) {
      console.log(
        "[BlogQueries] Successfully saved blog post:",
        result.data?.slug,
      );
    }

    return { success: true, slug: result.data?.slug };
  } catch (error) {
    console.error("[BlogQueries] Error saving blog post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deletes a blog post by slug
 * This function should be used with React Query mutations
 */
export async function deleteBlogPost(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(`[BlogQueries] Deleting blog post: ${slug}`);
    }

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error("[BlogQueries] Error deleting blog post:", error);
      return { success: false, error: error.message };
    }

    if (DEBUG_MODE) {
      console.log(`[BlogQueries] Successfully deleted blog post: ${slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[BlogQueries] Error deleting blog post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// SUPABASE CACHE HELPERS - SHARED QUERY BUILDERS
// ============================================================================

/**
 * Shared query builder for public blog posts
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildPublicBlogPostsQuery(
  supabase: SupabaseClient<Database>,
  limit?: number,
) {
  let query = supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      content,
      cover_image,
      date,
      author,
      author_user_id,
      category,
      featured,
      created_at,
      updated_at,
      draft,
      premium,
      content_type,
      recommendation_tags,
      author:author_user_id(id, name, picture)
    `,
    )
    .eq("draft", false)
    .order("date", { ascending: false });

  // Apply limit if provided
  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  return query;
}

/**
 * Shared query builder for single blog post by slug
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildBlogPostBySlugQuery(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  return supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:author_user_id(id, name, picture),
      blog_engagement(likes_count, views_count)
    `,
    )
    .eq("slug", slug)
    .eq("draft", false)
    .maybeSingle();
}

/**
 * Shared query builder for featured blog posts
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildFeaturedBlogPostsQuery(
  supabase: SupabaseClient<Database>,
  limit: number = 5,
) {
  return supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      cover_image,
      date,
      author,
      author_user_id,
      category,
      featured,
      created_at,
      updated_at,
      draft,
      premium,
      content_type,
      recommendation_tags,
      author:author_user_id(id, name, picture)
    `,
    )
    .eq("draft", false)
    .eq("featured", true)
    .order("date", { ascending: false })
    .limit(limit);
}

/**
 * Shared query builder for searching blog posts
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildSearchBlogPostsQuery(
  supabase: SupabaseClient<Database>,
  searchTerm: string,
) {
  const normalizedQuery = searchTerm.toLowerCase().trim();

  return supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      content,
      cover_image,
      date,
      author,
      author_user_id,
      category,
      featured,
      created_at,
      updated_at,
      draft,
      premium,
      content_type,
      recommendation_tags,
      author:author_user_id(id, name, picture)
    `,
    )
    .or(
      `title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%,excerpt.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`,
    )
    .eq("draft", false)
    .order("date", { ascending: false });
}

/**
 * Shared query builder for blog categories
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildBlogCategoriesQuery(supabase: SupabaseClient<Database>) {
  return supabase.from("blog_posts").select("category").eq("draft", false);
}

/**
 * Fetches posts by category
 */
export async function getBlogPostsByCategory(
  supabase: SupabaseClient<Database>,
  category: string,
): Promise<PublicBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Fetching blog posts for category: ${category}`,
      );
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
      )
      .eq("draft", false)
      .eq("category", category)
      .order("date", { ascending: false });

    if (error) {
      console.error("[BlogQueries] Error fetching posts by category:", error);
      throw new Error(
        `Failed to fetch posts for category ${category}: ${error.message}`,
      );
    }

    if (!data) {
      if (DEBUG_MODE) {
        console.log(`[BlogQueries] No posts found for category: ${category}`);
      }
      return [];
    }

    // Transform the data to match our expected format
    const transformedData = data.map((post: any) => ({
      ...post,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name || "Anonymous",
            email: "",
            picture: post.author.picture || null,
            role: "author",
          }
        : post.author || "Anonymous",
    }));

    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Successfully fetched ${transformedData.length} posts for category: ${category}`,
      );
    }

    return transformedData;
  } catch (error) {
    console.error("[BlogQueries] Error in getBlogPostsByCategory:", error);
    throw error;
  }
}

/**
 * Fetches posts for followed topics (requires user session)
 */
export async function getFollowingPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PublicBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(`[BlogQueries] Fetching following posts for user: ${userId}`);
    }

    // First, get the user's followed topics
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("followed_topics")
      .eq("id", userId)
      .single();

    if (
      userError ||
      !userData?.followed_topics ||
      userData.followed_topics.length === 0
    ) {
      if (DEBUG_MODE) {
        console.log("[BlogQueries] No followed topics found for user");
      }
      return [];
    }

    const followedTopics = userData.followed_topics;

    // Then, get posts from those categories
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
      )
      .eq("draft", false)
      .in("category", followedTopics)
      .order("date", { ascending: false });

    if (error) {
      console.error("[BlogQueries] Error fetching following posts:", error);
      throw new Error(`Failed to fetch following posts: ${error.message}`);
    }

    if (!data) {
      if (DEBUG_MODE) {
        console.log("[BlogQueries] No following posts found");
      }
      return [];
    }

    // Transform the data to match our expected format
    const transformedData = data.map((post: any) => ({
      ...post,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name || "Anonymous",
            email: "",
            picture: post.author.picture || null,
            role: "author",
          }
        : post.author || "Anonymous",
    }));

    if (DEBUG_MODE) {
      console.log(
        `[BlogQueries] Successfully fetched ${transformedData.length} following posts`,
      );
    }

    return transformedData;
  } catch (error) {
    console.error("[BlogQueries] Error in getFollowingPosts:", error);
    throw error;
  }
}

// ============================================================================
// SUPABASE CACHE HELPERS - OPTIMIZED QUERY HOOKS
// ============================================================================

/**
 * Hook for fetching public blog posts using Supabase Cache Helpers
 * This replaces the manual useQuery + getPublicBlogPosts pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 * Now uses manual engagement join for real engagement data
 */
export function usePublicBlogPostsWithHelpers(
  supabase: SupabaseClient<Database>,
  limit?: number,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: limit
      ? blogQueryKeys.publicPostsWithLimit(limit)
      : blogQueryKeys.publicPosts(),
    queryFn: () => getPublicBlogPosts(supabase, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching a single blog post by slug using Supabase Cache Helpers
 * This replaces the manual useQuery + getBlogPostBySlug pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 * Now uses manual engagement join for real engagement data
 */
export function useBlogPostBySlugWithHelpers(
  supabase: SupabaseClient<Database>,
  slug: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: blogQueryKeys.post(slug),
    queryFn: () => getBlogPostBySlug(supabase, slug),
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 or similar client error
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching featured blog posts using Supabase Cache Helpers
 * This replaces the manual useQuery + getFeaturedBlogPosts pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 * Now uses manual engagement join for real engagement data
 */
export function useFeaturedBlogPostsWithHelpers(
  supabase: SupabaseClient<Database>,
  limit: number = 5,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: [...blogQueryKeys.featuredPosts(), limit],
    queryFn: () => getFeaturedBlogPosts(supabase, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for searching blog posts using Supabase Cache Helpers
 * This replaces the manual useQuery + searchBlogPosts pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 * Now uses manual engagement join for real engagement data
 */
export function useSearchBlogPostsWithHelpers(
  supabase: SupabaseClient<Database>,
  searchTerm: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: blogQueryKeys.search(searchTerm),
    queryFn: () => searchBlogPosts(supabase, searchTerm),
    enabled: enabled && !!searchTerm.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes (search results change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch search results on focus
  });
}

/**
 * Hook for fetching blog categories using Supabase Cache Helpers
 * This replaces the manual useQuery + getBlogCategories pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 */
export function useBlogCategoriesWithHelpers(
  supabase: SupabaseClient<Database>,
) {
  return useReactQuery({
    queryKey: blogQueryKeys.categories(),
    queryFn: () => getBlogCategories(supabase),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Categories rarely change
  });
}

/**
 * Hook for fetching posts by category using Supabase Cache Helpers
 */
export function useBlogPostsByCategoryWithHelpers(
  supabase: SupabaseClient<Database>,
  category: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: [...blogQueryKeys.publicPosts(), "category", category],
    queryFn: () => getBlogPostsByCategory(supabase, category),
    enabled: enabled && !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching following posts using Supabase Cache Helpers
 */
export function useFollowingPostsWithHelpers(
  supabase: SupabaseClient<Database>,
  userId: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: [...blogQueryKeys.publicPosts(), "following", userId],
    queryFn: () => getFollowingPosts(supabase, userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// SUPABASE CACHE HELPERS - OPTIMIZED MUTATION HOOKS
// ============================================================================

/**
 * Hook for saving (creating or updating) blog posts using Supabase Cache Helpers
 * This replaces the manual useMutation + saveBlogPost pattern
 * Benefits: Automatic cache updates, no manual invalidation needed, optimistic updates
 */
export function useSaveBlogPostMutation(supabase: SupabaseClient<Database>) {
  return useUpsertMutation(
    supabase.from("blog_posts"),
    ["id"], // Primary key for upsert operations
    "*", // Return all columns for comprehensive cache updates
    {
      onSuccess: () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Successfully saved blog post with automatic cache updates",
          );
        }
      },
      onError: (error) => {
        console.error("[BlogQueries] Error saving blog post:", error);
      },
    },
  );
}

// ============================================================================
// BLOG ENGAGEMENT QUERIES AND MUTATIONS
// ============================================================================

/**
 * Shared query builder for blog engagement metrics by slug
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildBlogEngagementQuery(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  return supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      blog_engagement(likes_count, views_count)
    `,
    )
    .eq("slug", slug)
    .eq("draft", false)
    .maybeSingle();
}

/**
 * Hook for fetching blog engagement metrics using manual engagement join
 * This provides real-time engagement data with automatic caching
 * Now uses real comments count from comments table
 */
export function useBlogEngagementWithHelpers(
  supabase: SupabaseClient<Database>,
  slug: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: blogQueryKeys.engagement(slug),
    queryFn: async () => {
      // First get the blog post to get its ID
      const { data: post, error } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .eq("draft", false)
        .maybeSingle();

      if (error || !post) {
        throw new Error(`Blog post not found: ${slug}`);
      }

      // Use manual engagement join for this single post
      const postWithEngagement = await fetchBlogPostWithEngagement(
        supabase,
        post,
      );

      return {
        id: post.id,
        slug: slug,
        blog_engagement: [
          {
            likes_count: postWithEngagement.likes_count || 0,
            views_count: postWithEngagement.views_count || 0,
          },
        ],
      };
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 1000, // 10 seconds (engagement data changes frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch to get latest engagement counts
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}

// ============================================================================
// CUSTOM PREFETCH FUNCTIONS FOR SERVER-SIDE PREFETCHING
// ============================================================================

/**
 * Custom prefetch function for public blog posts with engagement data
 * This replaces the broken Supabase JOIN syntax with working manual engagement join
 */
export async function prefetchPublicBlogPostsWithEngagement(
  queryClient: any,
  supabase: SupabaseClient<Database>,
) {
  await queryClient.prefetchQuery({
    queryKey: blogQueryKeys.publicPosts(),
    queryFn: () => getPublicBlogPosts(supabase),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom prefetch function for single blog post with engagement data
 * This replaces the broken Supabase JOIN syntax with working manual engagement join
 */
export async function prefetchBlogPostWithEngagement(
  queryClient: any,
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  await queryClient.prefetchQuery({
    queryKey: blogQueryKeys.post(slug),
    queryFn: () => getBlogPostBySlug(supabase, slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Custom prefetch function for featured blog posts with engagement data
 * This replaces the broken Supabase JOIN syntax with working manual engagement join
 */
export async function prefetchFeaturedBlogPostsWithEngagement(
  queryClient: any,
  supabase: SupabaseClient<Database>,
  limit: number = 5,
) {
  await queryClient.prefetchQuery({
    queryKey: [...blogQueryKeys.featuredPosts(), limit],
    queryFn: () => getFeaturedBlogPosts(supabase, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch blog categories
 */
export async function prefetchBlogCategories(
  queryClient: any,
  supabase: SupabaseClient<Database>,
) {
  await queryClient.prefetchQuery({
    queryKey: blogQueryKeys.categories(),
    queryFn: () => getBlogCategories(supabase),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
  });
}

/**
 * @deprecated Use api.blog.incrementView.useMutation() directly instead
 * Hook for tracking blog post views using React Query mutation
 * This provides automatic view counting with cache updates
 * Benefits: Standardized mutation pattern, automatic cache updates, no authentication required
 */
export function useViewBlogPostMutation(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      // Legacy implementation - use tRPC directly in components instead
      throw new Error(
        "This function is deprecated. Use api.blog.incrementView.useMutation() directly.",
      );
    },
    onSuccess: (data, slug) => {
      // Legacy implementation - no cache updates needed
      if (process.env.NODE_ENV === "development") {
        console.log(`📊 [ViewMutation] Deprecated function called for ${slug}`);
      }
    },
    onError: (error, slug) => {
      console.error("[BlogQueries] Error tracking view:", error);

      // Invalidate all related queries to refetch fresh data on error
      invalidateEngagementQueries(queryClient, slug);
    },
  });
}

// ============================================================================
// CACHE INVALIDATION UTILITIES
// ============================================================================

/**
 * Comprehensive cache invalidation for engagement updates
 * Ensures all related queries are invalidated for real-time synchronization
 */
function invalidateEngagementQueries(queryClient: any, slug: string) {
  // Invalidate all blog post queries (public, featured, search results)
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.allPosts(),
  });

  // Invalidate specific post query
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.post(slug),
  });

  // Invalidate engagement query for this specific post
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.engagement(slug),
  });

  // Invalidate all engagement queries
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.allEngagement(),
  });

  // Invalidate featured posts (they might include this post)
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.featuredPosts(),
  });

  // Invalidate categories (for category-based listings)
  queryClient.invalidateQueries({
    queryKey: blogQueryKeys.categories(),
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🔄 [CacheInvalidation] Invalidated all blog queries for engagement update on ${slug}`,
    );
  }
}

/**
 * Client-side engagement update dispatcher
 * Dispatches custom events for cross-component synchronization
 */
function dispatchEngagementUpdate(data: {
  slug: string;
  likes_count?: number;
  views_count?: number;
  type?: "like" | "view";
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("engagement-updated", {
        detail: {
          slug: data.slug,
          likes_count: data.likes_count,
          views_count: data.views_count,
          type: data.type,
          timestamp: Date.now(),
        },
      }),
    );

    if (process.env.NODE_ENV === "development") {
      console.log(
        `📡 [EngagementDispatch] Dispatched engagement update for ${data.slug}:`,
        data,
      );
    }
  }
}

/**
 * Update cache data optimistically for immediate UI feedback
 * This ensures users see changes immediately before server confirmation
 */
function updateEngagementCacheData(
  queryClient: any,
  slug: string,
  updates: { likes_count?: number; views_count?: number },
) {
  // Update blog listing queries (public posts, featured posts, search results)
  const blogListingQueries = [
    blogQueryKeys.publicPosts(),
    blogQueryKeys.featuredPosts(),
  ];

  blogListingQueries.forEach((queryKey) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;

      return oldData.map((post: any) => {
        if (post.slug === slug) {
          return {
            ...post,
            ...updates,
          };
        }
        return post;
      });
    });
  });

  // Update individual post query
  queryClient.setQueryData(blogQueryKeys.post(slug), (oldData: any) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      ...updates,
    };
  });

  // Update engagement query
  queryClient.setQueryData(blogQueryKeys.engagement(slug), (oldData: any) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      blog_engagement: [
        {
          ...oldData.blog_engagement?.[0],
          ...updates,
        },
      ],
    };
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `⚡ [CacheUpdate] Optimistically updated cache data for ${slug}:`,
      updates,
    );
  }
}

/**
 * Hook for liking blog posts using React Query mutation
 * This replaces the manual fetch + optimistic updates pattern in LikeButton
 * Benefits: Standardized mutation pattern, automatic cache updates, better error handling
 */
export function useLikeBlogPostMutation(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      increment,
    }: {
      slug: string;
      increment: number;
    }) => {
      // Call the existing API route for liking
      const response = await fetch(`/api/blog/engagement/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ increment }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to like: ${response.status}`,
        );
      }

      return response.json();
    },
    onMutate: async ({ slug, increment }) => {
      // Cancel any outgoing refetches for engagement data
      await queryClient.cancelQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.some(
              (key) =>
                typeof key === "string" &&
                (key.includes(slug) || key.includes("blog_engagement")),
            )
          );
        },
      });

      // Optimistically update all related queries
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey.some(
                (key) => typeof key === "string" && key.includes(slug),
              )
            );
          },
        },
        (old: any) => {
          if (!old) return old;
          const engagement = old.blog_engagement?.[0];
          if (engagement) {
            return {
              ...old,
              likes_count:
                (old.likes_count || engagement.likes_count || 0) + increment,
              blog_engagement: [
                {
                  ...engagement,
                  likes_count: (engagement.likes_count || 0) + increment,
                },
              ],
            };
          }
          return old;
        },
      );

      return { slug, increment };
    },
    onError: (err, { slug }, context) => {
      // Invalidate all related queries to refetch fresh data on error
      invalidateEngagementQueries(queryClient, slug);
      console.error("[BlogQueries] Error liking blog post:", err);
    },
    onSuccess: (data, { slug }) => {
      // Update cache with server response
      const serverUpdates = {
        likes_count: data.likes_count,
        views_count: data.views_count,
      };

      updateEngagementCacheData(queryClient, slug, serverUpdates);

      // Invalidate all related queries for consistency
      invalidateEngagementQueries(queryClient, slug);

      // Dispatch event for cross-component synchronization
      dispatchEngagementUpdate({
        slug,
        likes_count: data.likes_count,
        views_count: data.views_count,
        type: "like",
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ [LikeMutation] Successfully liked blog post ${slug} with comprehensive cache updates`,
        );
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for deleting blog posts using Supabase Cache Helpers
 * This replaces the manual useMutation + deleteBlogPost pattern
 * Benefits: Automatic cache updates, no manual invalidation needed, automatic count updates
 */
export function useDeleteBlogPostMutation(supabase: SupabaseClient<Database>) {
  return useDeleteMutation(
    supabase.from("blog_posts"),
    ["id"], // Primary key for delete operations
    "*", // Return columns for cache updates
    {
      onSuccess: () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Successfully deleted blog post with automatic cache updates",
          );
        }
      },
      onError: (error) => {
        console.error("[BlogQueries] Error deleting blog post:", error);
      },
    },
  );
}
