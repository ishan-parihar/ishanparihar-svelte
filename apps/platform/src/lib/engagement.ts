import "server-only";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { BlogPost, BlogEngagement } from "./supabase";

/**
 * Fetch engagement metrics for a specific blog post (enhanced version)
 */
export async function getBlogEngagement(
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return null;
    }

    const { data, error } = await supabase
      .from("blog_engagement")
      .select("*")
      .eq("blog_post_id", blogPostId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No engagement record exists, return null
        return null;
      }
      console.error("[Engagement] Error fetching engagement metrics:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Engagement] Exception in getBlogEngagement:", error);
    return null;
  }
}

/**
 * Fetch engagement metrics for a specific blog post (legacy version for backward compatibility)
 */
export async function getBlogPostEngagement(
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return null;
    }

    // Try new table first, then fall back to old table
    const { data: newData, error: newError } = await supabase
      .from("blog_engagement")
      .select(
        "id, blog_post_id, user_id, likes_count, views_count, created_at, updated_at",
      )
      .eq("blog_post_id", blogPostId)
      .single();

    if (!newError && newData) {
      return newData;
    }

    // Fall back to old table
    const { data, error } = await supabase
      .from("blog_post_engagement")
      .select("*")
      .eq("blog_post_id", blogPostId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No engagement record exists, return default values
        return {
          id: "",
          blog_post_id: blogPostId,
          user_id: null,
          likes_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      console.error("[Engagement] Error fetching engagement metrics:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Engagement] Exception in getBlogPostEngagement:", error);
    return null;
  }
}

/**
 * Fetch engagement metrics for multiple blog posts (enhanced version)
 */
export async function getBlogPostsEngagement(
  blogPostIds: string[],
): Promise<Record<string, BlogEngagement>> {
  try {
    if (blogPostIds.length === 0) {
      return {};
    }

    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return {};
    }

    const { data, error } = await supabase
      .from("blog_engagement")
      .select("*")
      .in("blog_post_id", blogPostIds);

    if (error) {
      console.error(
        "[Engagement] Error fetching engagement metrics for multiple posts:",
        error,
      );
      return {};
    }

    // Convert array to map for easy lookup
    const engagementMap: Record<string, BlogEngagement> = {};
    if (data) {
      data.forEach((engagement: any) => {
        engagementMap[engagement.blog_post_id] = engagement;
      });
    }

    return engagementMap;
  } catch (error) {
    console.error("[Engagement] Exception in getBlogPostsEngagement:", error);
    return {};
  }
}

/**
 * Fetch engagement metrics for multiple blog posts (legacy version for backward compatibility)
 */
export async function getBlogPostsEngagementLegacy(
  blogPostIds: string[],
): Promise<Record<string, BlogEngagement>> {
  try {
    if (blogPostIds.length === 0) {
      return {};
    }

    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return {};
    }

    // Try new table first
    const { data: newData, error: newError } = await supabase
      .from("blog_engagement")
      .select(
        "id, blog_post_id, user_id, likes_count, views_count, created_at, updated_at",
      )
      .in("blog_post_id", blogPostIds);

    if (!newError && newData && newData.length > 0) {
      const engagementMap: Record<string, BlogEngagement> = {};
      newData.forEach((engagement: any) => {
        engagementMap[engagement.blog_post_id] = engagement;
      });
      return engagementMap;
    }

    // Fall back to old table
    const { data, error } = await supabase
      .from("blog_post_engagement")
      .select("*")
      .in("blog_post_id", blogPostIds);

    if (error) {
      console.error(
        "[Engagement] Error fetching engagement metrics for multiple posts:",
        error,
      );
      return {};
    }

    // Convert array to record for easy lookup
    const engagementMap: Record<string, BlogEngagement> = {};

    data?.forEach((engagement: any) => {
      engagementMap[engagement.blog_post_id] = engagement;
    });

    // Fill in missing engagement records with default values
    blogPostIds.forEach((postId) => {
      if (!engagementMap[postId]) {
        engagementMap[postId] = {
          id: "",
          blog_post_id: postId,
          user_id: null,
          likes_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    });

    return engagementMap;
  } catch (error) {
    console.error("[Engagement] Exception in getBlogPostsEngagement:", error);
    return {};
  }
}

/**
 * Enrich blog posts with engagement metrics
 */
export async function enrichBlogPostsWithEngagement(
  posts: BlogPost[],
): Promise<BlogPost[]> {
  try {
    if (posts.length === 0) {
      return posts;
    }

    // Extract post IDs
    const postIds = posts.map((post) => post.id).filter(Boolean) as string[];

    if (postIds.length === 0) {
      return posts;
    }

    // Fetch engagement metrics
    const engagementMap = await getBlogPostsEngagement(postIds);

    // Enrich posts with engagement data
    return posts.map((post) => {
      if (!post.id) return post;

      const engagement = engagementMap[post.id];
      return {
        ...post,
        likes_count: engagement?.likes_count || 0,
        comments_count: 0, // Comments fetched from comments table
        views_count: engagement?.views_count || 0,
      };
    });
  } catch (error) {
    console.error(
      "[Engagement] Exception in enrichBlogPostsWithEngagement:",
      error,
    );
    return posts;
  }
}

/**
 * Initialize engagement record for a blog post (enhanced version)
 */
export async function initializeBlogEngagement(
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return null;
    }

    const { data, error } = await supabase
      .from("blog_engagement")
      .insert({
        blog_post_id: blogPostId,
        likes_count: 0,
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[Engagement] Error initializing engagement record:",
        error,
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Engagement] Exception in initializeBlogEngagement:", error);
    return null;
  }
}

/**
 * Initialize engagement record for a blog post (legacy version for backward compatibility)
 */
export async function initializeBlogPostEngagement(
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Engagement] Failed to create Supabase client");
      return null;
    }

    // Try to create in new table first
    const { data: newData, error: newError } = await supabase
      .from("blog_engagement")
      .insert({
        blog_post_id: blogPostId,
        likes_count: 0,
        views_count: 0,
      })
      .select(
        "id, blog_post_id, user_id, likes_count, views_count, created_at, updated_at",
      )
      .single();

    if (!newError && newData) {
      return newData;
    }

    // Fall back to old table
    const { data, error } = await supabase
      .from("blog_post_engagement")
      .insert({
        blog_post_id: blogPostId,
        likes_count: 0,
        comments_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[Engagement] Error initializing engagement record:",
        error,
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error(
      "[Engagement] Exception in initializeBlogPostEngagement:",
      error,
    );
    return null;
  }
}
