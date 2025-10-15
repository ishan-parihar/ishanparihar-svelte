/**
 * Comments Module (Server-side)
 *
 * This module provides server-side functions to interact with the comments system.
 * It includes types, utility functions, and API wrappers for comment operations.
 *
 * IMPORTANT: This module contains server-only functions that use cache invalidation.
 * For client-side utilities, use @/lib/comments-client instead.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { invalidateCommentsCache } from "./cache-invalidation-server";

// Check if the comments table exists and create it if it doesn't
export async function ensureCommentsTableExists(
  supabase: SupabaseClient<Database>,
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Check if the comments table exists
    const { data, error } = await supabase
      .from("comments")
      .select("id")
      .limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist
      console.log("[Comments] Comments table doesn't exist, creating it...");

      // Create the comments table
      const { error: createError } = await supabase.rpc(
        "create_comments_table",
      );

      if (createError) {
        console.error("[Comments] Error creating comments table:", createError);
        return false;
      }

      console.log("[Comments] Comments table created successfully");
      return true;
    } else if (error) {
      console.error("[Comments] Error checking comments table:", error);
      return false;
    }

    // Table exists
    return true;
  } catch (error) {
    console.error(
      "[Comments] Exception checking/creating comments table:",
      error,
    );
    return false;
  }
}

// Types for comments
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

// Get all comments for a blog post
export async function getCommentsForPost(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
): Promise<Comment[]> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return [];
    }

    // First, fetch the comments without joining with users to avoid RLS recursion
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("blog_post_id", blogPostId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("[Comments] Error fetching comments:", commentsError);
      return [];
    }

    // If no comments, return empty array
    if (!commentsData || commentsData.length === 0) {
      return [];
    }

    // Now fetch user data for each comment using the security definer function
    // This avoids the RLS recursion issue
    const comments: Comment[] = [];

    for (const comment of commentsData) {
      // Fetch user data using the security definer function
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_for_comment",
        { user_id: comment.user_id },
      );

      if (userError) {
        console.error(
          `[Comments] Error fetching user data for comment ${comment.id}:`,
          userError,
        );
        // Continue with the next comment, using default values for this one
      }

      const user = userData && userData.length > 0 ? userData[0] : null;

      // For Google accounts, set user_image to the same value as user_picture
      const userPicture = user?.picture || "";
      const isGoogleAccount = user?.provider === "google";

      comments.push({
        id: comment.id,
        blog_post_id: comment.blog_post_id,
        user_id: comment.user_id,
        user_email: user?.email || "",
        user_name: user?.name || "Anonymous",
        user_picture: userPicture,
        // For Google accounts, set user_image to the same value as user_picture
        user_image: isGoogleAccount ? userPicture : undefined,
        user_custom_picture: user?.custom_picture || false,
        user_provider: user?.provider || "email",
        parent_id: comment.parent_id,
        content: comment.content,
        is_approved: comment.is_approved,
        is_deleted: comment.is_deleted,
        deleted_by_user: comment.deleted_by_user || false,
        moderator_comment: comment.moderator_comment || "",
        is_reported: comment.is_reported || false,
        report_reason: comment.report_reason || "",
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      });
    }

    // Organize comments into a tree structure
    return organizeCommentsIntoTree(comments);
  } catch (error) {
    console.error("[Comments] Exception fetching comments:", error);
    return [];
  }
}

// Get all comments for admin management
export async function getAllComments(
  supabase: SupabaseClient<Database>,
): Promise<Comment[]> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return [];
    }

    // Fetch all comments with user and blog post information
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users:user_id (
          name,
          picture,
          email,
          custom_picture,
          provider
        ),
        blog_posts:blog_post_id (
          title
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Comments] Error fetching all comments:", error);
      return [];
    }

    // Transform the data to match the Comment type
    const comments: Comment[] = data.map((comment: any) => {
      // For Google accounts, set user_image to the same value as user_picture
      // This ensures the image parameter is available for getProfilePicture
      const userPicture = comment.users?.picture || "";
      const isGoogleAccount = comment.users?.provider === "google";

      return {
        id: comment.id,
        blog_post_id: comment.blog_post_id,
        blog_post_title: comment.blog_posts?.title || "Unknown Post",
        user_id: comment.user_id,
        user_email: comment.users?.email || "",
        user_name: comment.users?.name || "Anonymous",
        user_picture: userPicture,
        // For Google accounts, set user_image to the same value as user_picture
        user_image: isGoogleAccount ? userPicture : undefined,
        user_custom_picture: comment.users?.custom_picture || false,
        user_provider: comment.users?.provider || "email",
        parent_id: comment.parent_id,
        content: comment.content,
        is_approved: comment.is_approved,
        is_deleted: comment.is_deleted,
        deleted_by_user: comment.deleted_by_user || false,
        moderator_comment: comment.moderator_comment || "",
        is_reported: comment.is_reported || false,
        report_reason: comment.report_reason || "",
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      };
    });

    return comments;
  } catch (error) {
    console.error("[Comments] Exception fetching all comments:", error);
    return [];
  }
}

// Create a new comment
export async function createComment(
  supabase: SupabaseClient<Database>,
  comment: NewComment,
): Promise<Comment | null> {
  try {
    console.log("[Comments] Creating comment with data:", comment);

    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return null;
    }

    // Verify the blog post exists
    const { data: postData, error: postError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("id", comment.blog_post_id)
      .single();

    if (postError) {
      // If the blog post doesn't exist, try to create a placeholder post
      // This is useful for development and testing
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Comments] Blog post with ID ${comment.blog_post_id} not found, creating placeholder in development mode`,
        );
        try {
          const { data: newPost, error: createPostError } = await supabase
            .from("blog_posts")
            .upsert({
              id: comment.blog_post_id,
              title: "Placeholder Post",
              slug: `placeholder-${comment.blog_post_id.substring(0, 8)}`,
              content:
                "This is a placeholder post created for testing comments.",
              is_published: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createPostError) {
            console.error(
              `[Comments] Failed to create placeholder blog post:`,
              createPostError,
            );
            throw new Error(
              `Blog post not found and could not create placeholder: ${createPostError.message}`,
            );
          }

          console.log(
            `[Comments] Created placeholder blog post with ID ${newPost.id}`,
          );
        } catch (createError) {
          console.error(
            `[Comments] Exception creating placeholder blog post:`,
            createError,
          );
          throw new Error(`Blog post not found: ${postError.message}`);
        }
      } else {
        console.error(
          `[Comments] Blog post with ID ${comment.blog_post_id} not found:`,
          postError,
        );
        throw new Error(`Blog post not found: ${postError.message}`);
      }
    }

    // Insert the new comment
    const { data, error } = await supabase
      .from("comments")
      .insert({
        blog_post_id: comment.blog_post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id || null,
        content: comment.content,
        is_approved: true, // Auto-approve all comments for now
        is_deleted: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[Comments] Error creating comment:", error);
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    console.log("[Comments] Comment created successfully:", data);
    return data as Comment;
  } catch (error) {
    console.error("[Comments] Exception creating comment:", error);
    throw error; // Re-throw to allow handling in the API route
  }
}

// Update a comment's approval status
export async function updateCommentApproval(
  supabase: SupabaseClient<Database>,
  commentId: string,
  isApproved: boolean,
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Update the comment's approval status
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: isApproved })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error updating comment approval:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Comments] Exception updating comment approval:", error);
    return false;
  }
}

// Mark a comment as deleted by user
export async function deleteComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
  userEmail: string,
  isAdmin: boolean = false,
): Promise<boolean> {
  try {
    console.log("[Comments] Deleting comment:", {
      commentId,
      userEmail,
      isAdmin,
    });

    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // First, verify that the user is the author of the comment
    if (!isAdmin) {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          users:user_id (
            email
          )
        `,
        )
        .eq("id", commentId)
        .single();

      if (commentError) {
        console.error(
          "[Comments] Error fetching comment for permission check:",
          commentError,
        );
        return false;
      }

      console.log("[Comments] Comment data for permission check:", commentData);

      // Extract the email from the users object - handle both array and object formats
      let commentAuthorEmail: string | undefined;
      if (Array.isArray(commentData?.users)) {
        commentAuthorEmail = commentData?.users[0]?.email;
      } else {
        // Handle the case where users is an object with email property
        commentAuthorEmail = (commentData?.users as any)?.email;
      }

      if (
        !commentData ||
        !commentData.users ||
        !commentAuthorEmail ||
        commentAuthorEmail !== userEmail
      ) {
        console.error(
          "[Comments] Permission denied: User is not the author of the comment",
        );
        console.error(
          "[Comments] Comment author:",
          commentAuthorEmail,
          "Request from:",
          userEmail,
        );
        return false;
      }
    }

    // Mark the comment as deleted by user
    const { error } = await supabase
      .from("comments")
      .update({
        is_deleted: true,
        deleted_by_user: true,
      })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error deleting comment:", error);
      return false;
    }

    console.log(
      "[Comments] Comment successfully marked as deleted by user:",
      commentId,
    );
    return true;
  } catch (error) {
    console.error("[Comments] Exception deleting comment:", error);
    return false;
  }
}

// Mark a comment as deleted by admin
export async function adminDeleteComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
  moderatorComment: string = "",
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Mark the comment as deleted by admin with optional moderator comment
    const { error } = await supabase
      .from("comments")
      .update({
        is_deleted: true,
        deleted_by_user: false,
        moderator_comment: moderatorComment,
      })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error admin deleting comment:", error);
      return false;
    }

    // Invalidate cache to ensure admin dashboard updates immediately
    try {
      await invalidateCommentsCache();
      console.log("[Comments] Cache invalidated after admin deletion");
    } catch (cacheError) {
      console.warn("[Comments] Cache invalidation failed:", cacheError);
      // Don't fail the deletion if cache invalidation fails
    }

    return true;
  } catch (error) {
    console.error("[Comments] Exception admin deleting comment:", error);
    return false;
  }
}

// Permanently delete a comment from the database
export async function permanentlyDeleteComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
): Promise<boolean> {
  try {
    console.log(
      "[Comments] Attempting to permanently delete comment:",
      commentId,
    );

    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Direct delete from comments table
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      console.log("[Comments] Successfully deleted comment");

      // Invalidate cache to ensure admin dashboard updates immediately
      try {
        await invalidateCommentsCache();
        console.log("[Comments] Cache invalidated after permanent deletion");
      } catch (cacheError) {
        console.warn("[Comments] Cache invalidation failed:", cacheError);
        // Don't fail the deletion if cache invalidation fails
      }

      return true;
    }

    console.error("[Comments] Error permanently deleting comment:", error);
    return false;
  } catch (error) {
    console.error("[Comments] Exception permanently deleting comment:", error);
    return false;
  }
}

// Restore a deleted comment
export async function restoreComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Restore the comment
    const { error } = await supabase
      .from("comments")
      .update({ is_deleted: false })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error restoring comment:", error);
      return false;
    }

    // Invalidate cache to ensure admin dashboard updates immediately
    try {
      await invalidateCommentsCache();
      console.log("[Comments] Cache invalidated after comment restoration");
    } catch (cacheError) {
      console.warn("[Comments] Cache invalidation failed:", cacheError);
      // Don't fail the restoration if cache invalidation fails
    }

    return true;
  } catch (error) {
    console.error("[Comments] Exception restoring comment:", error);
    return false;
  }
}

// Helper function to organize comments into a tree structure
function organizeCommentsIntoTree(comments: Comment[]): Comment[] {
  // Create a map of comments by ID for quick lookup
  const commentMap = new Map<string, Comment>();
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Create the tree structure
  const rootComments: Comment[] = [];

  commentMap.forEach((comment) => {
    if (comment.parent_id) {
      // This is a reply, add it to its parent's replies
      const parent = commentMap.get(comment.parent_id);
      if (parent && parent.replies) {
        parent.replies.push(comment);
      } else {
        // If parent not found (unusual case), treat as root comment
        rootComments.push(comment);
      }
    } else {
      // This is a root comment
      rootComments.push(comment);
    }
  });

  return rootComments;
}

// Report a comment
export async function reportComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
  reason: string,
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    console.log("[Comments] Reporting comment:", { commentId, reason });

    // Mark the comment as reported
    const { error } = await supabase
      .from("comments")
      .update({
        is_reported: true,
        report_reason: reason,
      })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error reporting comment:", error);
      return false;
    }

    console.log("[Comments] Comment reported successfully");
    return true;
  } catch (error) {
    console.error("[Comments] Exception reporting comment:", error);
    return false;
  }
}

// Edit a comment's content
export async function editComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
  newContent: string,
  userEmail?: string,
  isAdmin: boolean = false,
): Promise<boolean> {
  try {
    console.log("[Comments] Editing comment:", {
      commentId,
      newContent,
      userEmail,
      isAdmin,
    });

    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // First, verify that the user is the author of the comment if not admin
    if (!isAdmin && userEmail) {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          users:user_id (
            email
          )
        `,
        )
        .eq("id", commentId)
        .single();

      if (commentError) {
        console.error(
          "[Comments] Error fetching comment for permission check:",
          commentError,
        );
        return false;
      }

      console.log(
        "[Comments] Comment data for edit permission check:",
        commentData,
      );

      // Extract the email from the users object - handle both array and object formats
      let commentAuthorEmail: string | undefined;
      if (Array.isArray(commentData?.users)) {
        commentAuthorEmail = commentData?.users[0]?.email;
      } else {
        // Handle the case where users is an object with email property
        commentAuthorEmail = (commentData?.users as any)?.email;
      }

      // Check if the user is the author of the comment
      if (
        !commentData ||
        !commentData.users ||
        !commentAuthorEmail ||
        commentAuthorEmail !== userEmail
      ) {
        console.error(
          "[Comments] Permission denied: User is not the author of the comment",
        );
        console.error(
          "[Comments] Comment author:",
          commentAuthorEmail,
          "Request from:",
          userEmail,
        );
        return false;
      }
    }

    // Update the comment's content
    const { error } = await supabase
      .from("comments")
      .update({
        content: newContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error editing comment:", error);
      return false;
    }

    console.log("[Comments] Comment successfully edited:", commentId);
    return true;
  } catch (error) {
    console.error("[Comments] Exception editing comment:", error);
    return false;
  }
}

// Clear a comment's reported status
export async function clearReportedStatus(
  supabase: SupabaseClient<Database>,
  commentId: string,
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return false;
    }

    // Clear the reported status
    const { error } = await supabase
      .from("comments")
      .update({
        is_reported: false,
        report_reason: null,
      })
      .eq("id", commentId);

    if (error) {
      console.error("[Comments] Error clearing reported status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Comments] Exception clearing reported status:", error);
    return false;
  }
}

// Get blog post slug from ID
export async function getBlogPostSlugFromId(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
): Promise<string | null> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return null;
    }

    // Fetch the blog post slug
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("id", blogPostId)
      .single();

    if (error) {
      console.error("[Comments] Error fetching blog post slug:", error);
      return null;
    }

    return data?.slug || null;
  } catch (error) {
    console.error("[Comments] Exception fetching blog post slug:", error);
    return null;
  }
}

// Get comment count for a blog post
export async function getCommentCount(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
): Promise<number> {
  try {
    if (!supabase) {
      console.error("[Comments] Supabase client not initialized");
      return 0;
    }

    // Count approved non-deleted comments for the blog post
    // This is for display purposes only - we still show deleted comments in the UI
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("blog_post_id", blogPostId)
      .eq("is_approved", true)
      .eq("is_deleted", false);

    if (error) {
      console.error("[Comments] Error counting comments:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Comments] Exception counting comments:", error);
    return 0;
  }
}
