/**
 * Client-side comment utilities
 * This file contains only client-safe functions that can be used in client components
 */

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

/**
 * Get blog post slug from ID using tRPC (client-side safe)
 * This function makes a tRPC call and is safe to use in client components
 */
export async function getBlogPostSlugFromIdClient(
  blogPostId: string,
): Promise<string | null> {
  try {
    if (!blogPostId) {
      console.error("[Comments] Invalid blog post ID");
      return null;
    }

    // Create a vanilla tRPC client for direct calls
    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    });

    const result = await trpcClient.blog.getSlugFromId.query({
      id: blogPostId,
    });
    return result?.slug || null;
  } catch (error) {
    console.error("[Comments] Exception fetching blog post slug:", error);
    return null;
  }
}

// Re-export the Comment type for client components
export type Comment = {
  id: string;
  blog_post_id: string;
  blog_post_title?: string; // Will be populated when fetching
  user_id: string;
  user_email?: string; // Will be populated when fetching - needed for permission checks
  user_name?: string; // Will be populated when fetching
  user_picture?: string; // Will be populated when fetching
  user_image?: string; // For Google accounts, this will be populated with the same value as user_picture
  user_custom_picture?: boolean; // Flag to indicate if using custom picture
  user_provider?: string; // Provider (google, credentials, etc.)
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  deleted_by_user?: boolean; // Flag to indicate if deleted by user or admin
  moderator_comment?: string; // Comment from moderator explaining deletion reason
  is_reported?: boolean; // Flag for reported comments
  report_reason?: string; // Optional reason for reporting
  created_at: string;
  updated_at: string;
  replies?: Comment[]; // For nested comments
};

// Type for creating a new comment
export type NewComment = {
  blog_post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
};

/**
 * Get comment count for a blog post using tRPC (client-side safe)
 * This function makes a tRPC call and is safe to use in client components
 */
export async function getCommentCountClient(
  blogPostId: string,
): Promise<number> {
  try {
    if (!blogPostId) {
      console.error("[Comments] Invalid blog post ID");
      return 0;
    }

    // Create a vanilla tRPC client for direct calls
    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    });

    const result = await trpcClient.blog.getCommentCount.query({
      postId: blogPostId,
    });
    return result?.count || 0;
  } catch (error) {
    console.error("[Comments] Exception fetching comment count:", error);
    return 0;
  }
}
