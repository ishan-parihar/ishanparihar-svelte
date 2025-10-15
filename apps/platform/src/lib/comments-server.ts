import "server-only";
import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Type for comments with user information
export type CommentWithUser = {
  id: string;
  blog_post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
  replies?: CommentWithUser[];
};

/**
 * Get all comments for a specific blog post with user information (cached, server-only)
 * This function is cached for 5 minutes and uses the service role client
 *
 * @param blogPostId The ID of the blog post to get comments for
 * @returns Array of comments with user information
 */
export const getCachedCommentsForPost = unstable_cache(
  async (blogPostId: string): Promise<any[]> => {
    // Using service role client is appropriate here as we need to join with users table
    // which requires bypassing RLS to access user data for comments
    const supabase = createServiceRoleClient();

    try {
      console.log(
        `[comments-server] Fetching comments for blog post: ${blogPostId}`,
      );

      // Fetch comments with user information
      const { data: comments, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:users(id, name, email, picture, custom_picture, provider)
        `,
        )
        .eq("blog_post_id", blogPostId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(
          `[comments-server] Error fetching comments: ${error.message}`,
        );
        return [];
      }

      if (!comments || comments.length === 0) {
        console.log(
          `[comments-server] No comments found for blog post: ${blogPostId}`,
        );
        return [];
      }

      // Process comments to build a tree structure
      const commentMap = new Map<string, any>();
      const rootComments: any[] = [];

      // First pass: create a map of all comments with flattened user data
      comments.forEach((comment: any) => {
        // Debug log the raw user data from the database
        console.log(
          `[comments-server] Raw user data for comment ${comment.id}:`,
          {
            user_id: comment.user_id,
            user: comment.user,
          },
        );

        // Transform the nested user object to flattened properties for compatibility with CommentItem
        const processedComment = {
          id: comment.id,
          blog_post_id: comment.blog_post_id,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          is_approved: comment.is_approved !== false, // Default to true if not specified
          is_deleted: comment.is_deleted || false,
          deleted_by_user: comment.deleted_by_user || false,
          moderator_comment: comment.moderator_comment || "",
          is_reported: comment.is_reported || false,
          report_reason: comment.report_reason || "",
          // Flatten user data for compatibility with CommentItem component
          user_name: comment.user?.name || "Anonymous",
          user_email: comment.user?.email || "",
          user_picture: comment.user?.picture || "",
          // For Google accounts, set user_image to the same value as user_picture
          user_image:
            comment.user?.provider === "google"
              ? comment.user?.picture || ""
              : undefined,
          user_custom_picture: comment.user?.custom_picture || false,
          user_provider: comment.user?.provider || "email",
          replies: [],
        };

        commentMap.set(comment.id, processedComment);
      });

      // Second pass: build the tree structure
      comments.forEach((comment: any) => {
        const processedComment = commentMap.get(comment.id);

        if (processedComment) {
          if (comment.parent_id) {
            // This is a reply, add it to the parent's replies
            const parentComment = commentMap.get(comment.parent_id);
            if (parentComment && parentComment.replies) {
              parentComment.replies.push(processedComment);
            }
          } else {
            // This is a root comment
            rootComments.push(processedComment);
          }
        }
      });

      console.log(
        `[comments-server] Processed ${rootComments.length} root comments with replies`,
      );
      return rootComments;
    } catch (error) {
      console.error(
        `[comments-server] Unexpected error fetching comments: ${error}`,
      );
      return [];
    }
  },
  ["comments-for-post"],
  { revalidate: 300 }, // Cache for 5 minutes
);

/**
 * Get all comments with user information (cached, server-only)
 * This function is cached for 5 minutes and uses the service role client
 *
 * @returns Array of all comments with user information
 */
export const getCachedAllComments = unstable_cache(
  async (): Promise<any[]> => {
    // Using service role client is appropriate here as we need to join with users table
    // which requires bypassing RLS to access user data for all comments
    const supabase = createServiceRoleClient();

    try {
      console.log(`[comments-server] Fetching all comments`);

      // Fetch all comments with user information
      const { data: comments, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:users(id, name, email, picture, custom_picture, provider)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          `[comments-server] Error fetching all comments: ${error.message}`,
        );
        return [];
      }

      if (!comments || comments.length === 0) {
        console.log(`[comments-server] No comments found`);
        return [];
      }

      // Process comments to include flattened user information for compatibility
      const processedComments = comments.map((comment: any) => ({
        id: comment.id,
        blog_post_id: comment.blog_post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        is_approved: comment.is_approved !== false,
        is_deleted: comment.is_deleted || false,
        deleted_by_user: comment.deleted_by_user || false,
        moderator_comment: comment.moderator_comment || "",
        is_reported: comment.is_reported || false,
        report_reason: comment.report_reason || "",
        // Flatten user data for compatibility with CommentItem component
        user_name: comment.user?.name || "Anonymous",
        user_email: comment.user?.email || "",
        user_picture: comment.user?.picture || "",
        // For Google accounts, set user_image to the same value as user_picture
        user_image:
          comment.user?.provider === "google"
            ? comment.user?.picture || ""
            : undefined,
        user_custom_picture: comment.user?.custom_picture || false,
        user_provider: comment.user?.provider || "email",
      }));

      console.log(
        `[comments-server] Processed ${processedComments.length} comments`,
      );
      return processedComments;
    } catch (error) {
      console.error(
        `[comments-server] Unexpected error fetching all comments: ${error}`,
      );
      return [];
    }
  },
  ["all-comments"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["comments"], // Add cache tag for invalidation
  },
);
