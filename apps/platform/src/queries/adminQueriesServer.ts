import "server-only";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { AdminBlogPost } from "./adminQueries";

// ============================================================================
// SERVER-SIDE ADMIN QUERIES (for Server Components)
// ============================================================================

/**
 * Server-side function to fetch admin blog posts directly from Supabase
 * This is used in Server Components where fetch() with relative URLs doesn't work
 */
export async function getAdminBlogPostsServer(params?: {
  includeDrafts?: boolean;
  category?: string;
}): Promise<AdminBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(
        "[AdminQueriesServer] Fetching admin blog posts (server-side)...",
        params,
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[AdminQueriesServer] Failed to initialize Supabase service role client",
      );
      throw new Error("Database connection failed");
    }

    // Build the query
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
        draft,
        premium,
        created_at,
        updated_at
      `,
      )
      .order("date", { ascending: false });

    // Filter by draft status if not including drafts
    if (!params?.includeDrafts) {
      query = query.eq("draft", false);
    }

    // Filter by category if specified
    if (params?.category) {
      query = query.eq("category", params.category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Error fetching admin blog posts (server-side):", error);
      throw new Error("Failed to fetch blog posts");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminQueriesServer] Successfully fetched ${posts?.length || 0} posts (server-side)`,
      );
    }

    return posts || [];
  } catch (error) {
    console.error("Error fetching admin blog posts (server-side):", error);
    throw error;
  }
}

/**
 * Server-side function to fetch a single admin blog post by slug directly from Supabase
 * This is used in Server Components where fetch() with relative URLs doesn't work
 */
export async function getAdminBlogPostBySlugServer(
  slug: string,
): Promise<AdminBlogPost | null> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(
        "[AdminQueriesServer] Fetching admin blog post by slug (server-side)...",
        slug,
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[AdminQueriesServer] Failed to initialize Supabase service role client",
      );
      throw new Error("Database connection failed");
    }

    // Build the query
    const { data: post, error } = await supabase
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
        draft,
        premium,
        created_at,
        updated_at
      `,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(
        "Error fetching admin blog post by slug (server-side):",
        error,
      );
      throw new Error("Failed to fetch blog post");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminQueriesServer] Successfully fetched post: ${post?.title || "not found"} (server-side)`,
      );
    }

    return post || null;
  } catch (error) {
    console.error(
      "Error fetching admin blog post by slug (server-side):",
      error,
    );
    throw error;
  }
}
