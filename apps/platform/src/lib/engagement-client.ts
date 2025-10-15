import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase";
import { BlogEngagement } from "./supabase";

/**
 * Client-safe version of engagement functions
 * These functions work with any Supabase client (browser or server)
 */

/**
 * Fetch engagement metrics for multiple blog posts (client-safe version)
 */
export async function getBlogPostsEngagementClient(
  supabase: SupabaseClient<Database>,
  blogPostIds: string[],
): Promise<Record<string, BlogEngagement>> {
  try {
    if (blogPostIds.length === 0) {
      return {};
    }

    if (!supabase) {
      console.error("[Engagement] Supabase client not provided");
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
      data.forEach((engagement) => {
        engagementMap[engagement.blog_post_id] = engagement;
      });
    }

    return engagementMap;
  } catch (error) {
    console.error(
      "[Engagement] Exception in getBlogPostsEngagementClient:",
      error,
    );
    return {};
  }
}

/**
 * Fetch engagement metrics for a single blog post (client-safe version)
 */
export async function getBlogEngagementClient(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    if (!supabase) {
      console.error("[Engagement] Supabase client not provided");
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
    console.error("[Engagement] Exception in getBlogEngagementClient:", error);
    return null;
  }
}

/**
 * Legacy client-safe version for backward compatibility
 */
export async function getBlogPostEngagementClient(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
): Promise<BlogEngagement | null> {
  try {
    if (!supabase) {
      console.error("[Engagement] Supabase client not provided");
      return null;
    }

    // Try new table first
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
    console.error(
      "[Engagement] Exception in getBlogPostEngagementClient:",
      error,
    );
    return null;
  }
}

/**
 * Legacy client-safe version for multiple posts
 */
export async function getBlogPostsEngagementLegacyClient(
  supabase: SupabaseClient<Database>,
  blogPostIds: string[],
): Promise<Record<string, BlogEngagement>> {
  try {
    if (blogPostIds.length === 0) {
      return {};
    }

    if (!supabase) {
      console.error("[Engagement] Supabase client not provided");
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
      newData.forEach((engagement) => {
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

    data?.forEach((engagement) => {
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
    console.error(
      "[Engagement] Exception in getBlogPostsEngagementLegacyClient:",
      error,
    );
    return {};
  }
}
