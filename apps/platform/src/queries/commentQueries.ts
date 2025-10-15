import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useQuery as useSupabaseQuery,
  useInsertMutation,
  useUpdateMutation,
  useDeleteMutation,
  prefetchQuery as supabasePrefetchQuery,
} from "@supabase-cache-helpers/postgrest-react-query";

// Re-export prefetchQuery for convenience
export { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

// Comment Query Keys Factory
export const commentQueryKeys = {
  all: ["comments"] as const,

  // Comments for specific blog post
  forPost: (blogPostId: string) =>
    [...commentQueryKeys.all, "forPost", blogPostId] as const,

  // All comments (admin)
  allComments: () => [...commentQueryKeys.all, "all"] as const,
} as const;

// ============================================================================
// QUERY BUILDERS FOR SUPABASE CACHE HELPERS
// ============================================================================

/**
 * Build query for fetching comments for a specific blog post
 * This query fetches approved comments with user information
 */
export function buildCommentsForPostQuery(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
) {
  return supabase
    .from("comments")
    .select(
      `
      *,
      users:user_id (
        id,
        name,
        email,
        picture,
        custom_picture,
        provider
      )
    `,
    )
    .eq("blog_post_id", blogPostId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });
}

/**
 * Build query for creating a new comment
 * This is used by the insert mutation
 */
export function buildCreateCommentQuery(supabase: SupabaseClient<Database>) {
  return supabase.from("comments").insert({} as any); // Type will be provided by the mutation hook
}

// ============================================================================
// SUPABASE CACHE HELPERS - OPTIMIZED QUERY HOOKS
// ============================================================================

/**
 * Hook for fetching comments for a specific blog post using Supabase Cache Helpers
 * This replaces the manual fetch in CommentSection.tsx
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 */
export function useCommentsForPostWithHelpers(
  supabase: SupabaseClient<Database>,
  blogPostId: string,
  enabled: boolean = true,
) {
  return useSupabaseQuery(buildCommentsForPostQuery(supabase, blogPostId), {
    enabled: enabled && !!blogPostId,
    staleTime: 2 * 60 * 1000, // 2 minutes - comments might change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
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

// ============================================================================
// SUPABASE CACHE HELPERS - OPTIMIZED MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating new comments using tRPC with proper cache invalidation
 * This replaces the manual fetch pattern in CommentForm.tsx while providing
 * automatic cache invalidation through tRPC utils
 *
 * Note: We use tRPC for type safety and automatic cache management
 */
export function useCreateCommentMutation() {
  const { api } = require("@/lib/trpc-client");
  const utils = api.useUtils();

  return api.blog.createComment.useMutation({
    onSuccess: (data: any, variables: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Successfully created comment with tRPC:", data);
      }

      // CRITICAL FIX: Invalidate the getComments query to force a refetch
      utils.blog.getComments.invalidate();

      // Also invalidate comment count
      utils.blog.getCommentCount.invalidate();
    },
    onError: (error: any) => {
      console.error("[CommentQueries] Error creating comment:", error);
    },
  });
}

/**
 * Hook for admin comment approval using React Query with API route
 * This replaces manual fetch + invalidateQueries in admin components
 */
export function useApproveCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve comment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin comments cache
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.allComments(),
      });
    },
    onError: (error) => {
      console.error("[CommentQueries] Error approving comment:", error);
    },
  });
}

/**
 * Hook for admin comment deletion using React Query with API route
 * This replaces manual fetch + invalidateQueries in admin components
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      moderatorComment,
      permanent = false,
    }: {
      commentId: string;
      moderatorComment?: string;
      permanent?: boolean;
    }) => {
      const url = permanent
        ? `/api/comments/${commentId}?permanent=true`
        : `/api/comments/${commentId}`;

      const response = await fetch(url, {
        method: permanent ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_deleted: true,
          moderator_comment: moderatorComment,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${permanent ? "permanently delete" : "delete"} comment`,
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin comments cache
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.allComments(),
      });
    },
    onError: (error) => {
      console.error("[CommentQueries] Error deleting comment:", error);
    },
  });
}

/**
 * Hook for admin comment restoration using React Query with API route
 * This replaces manual fetch + invalidateQueries in admin components
 */
export function useRestoreCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(
        `/api/comments/${commentId}?action=restore`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to restore comment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin comments cache
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.allComments(),
      });
    },
    onError: (error) => {
      console.error("[CommentQueries] Error restoring comment:", error);
    },
  });
}

/**
 * Hook for clearing comment reports using React Query with API route
 * This replaces manual fetch + invalidateQueries in admin components
 */
export function useClearCommentReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_reported: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear report");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin comments cache
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.allComments(),
      });
    },
    onError: (error) => {
      console.error("[CommentQueries] Error clearing comment report:", error);
    },
  });
}

// ============================================================================
// SERVER-SIDE PREFETCHING UTILITIES
// ============================================================================

/**
 * Prefetch comments for a blog post on the server
 * This is used in Server Components for initial data loading
 */
export async function prefetchCommentsForPost(
  queryClient: any,
  supabase: SupabaseClient<Database>,
  blogPostId: string,
) {
  await supabasePrefetchQuery(
    queryClient,
    buildCommentsForPostQuery(supabase, blogPostId),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  );
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for creating a new comment
 */
export type NewComment = {
  blog_post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
};

/**
 * Type for comment with user information
 */
export type CommentWithUser = {
  id: string;
  blog_post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  is_reported: boolean;
  report_reason: string | null;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string | null;
    email: string;
    picture: string | null;
    custom_picture: string | null;
    provider: string | null;
  } | null;
};
