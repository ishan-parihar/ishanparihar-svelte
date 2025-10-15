import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Bookmark Query Keys Factory
export const bookmarkQueryKeys = {
  all: ["bookmarks"] as const,

  // User's bookmarks list
  userBookmarks: (
    userId?: string,
    params?: { limit?: number; offset?: number; category?: string },
  ) => [...bookmarkQueryKeys.all, "user", userId, params] as const,

  // Bookmark status for specific post
  status: (userId?: string, postId?: string) =>
    [...bookmarkQueryKeys.all, "status", userId, postId] as const,
} as const;

// Types for bookmark data
export interface BookmarkStatus {
  isBookmarked: boolean;
  bookmarkId: string | null;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  blog_post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    cover_image: string | null;
    date: string;
    author: string;
    author_user_id: string | null;
    category: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
    draft: boolean;
    premium: boolean;
  };
}

export interface UserBookmarksResponse {
  bookmarks: UserBookmark[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Hook for fetching bookmark status for a specific post
 * Uses GET /api/bookmarks/[postId]/status
 */
export function useBookmarkStatus(postId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: bookmarkQueryKeys.status(undefined, postId),
    queryFn: async (): Promise<BookmarkStatus> => {
      const response = await fetch(`/api/bookmarks/${postId}/status`);

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated - return default state
          return { isBookmarked: false, bookmarkId: null };
        }
        throw new Error(`Failed to fetch bookmark status: ${response.status}`);
      }

      return response.json();
    },
    enabled: enabled && !!postId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching user's bookmarked posts
 * Uses GET /api/bookmarks with pagination and filtering
 */
export function useUserBookmarks(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  enabled?: boolean;
}) {
  const { limit = 20, offset = 0, category, enabled = true } = params || {};

  return useQuery({
    queryKey: bookmarkQueryKeys.userBookmarks(undefined, {
      limit,
      offset,
      category,
    }),
    queryFn: async (): Promise<UserBookmarksResponse> => {
      // Legacy implementation - use tRPC directly in components instead
      throw new Error(
        "This function is deprecated. Use api.blog.getBookmarks.useQuery() directly.",
      );
    },
    enabled,
    staleTime: 0, // Always consider stale for immediate updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });
}

/**
 * @deprecated Use api.blog.toggleBookmark.useMutation() directly instead
 * Hook for adding a bookmark with optimistic updates
 * Uses POST /api/bookmarks
 */
export function useAddBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // Legacy implementation - use tRPC directly in components instead
      throw new Error(
        "This function is deprecated. Use api.blog.toggleBookmark.useMutation() directly.",
      );
    },
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches for bookmark status
      await queryClient.cancelQueries({
        queryKey: bookmarkQueryKeys.status(undefined, postId),
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<BookmarkStatus>(
        bookmarkQueryKeys.status(undefined, postId),
      );

      // Optimistically update bookmark status
      queryClient.setQueryData<BookmarkStatus>(
        bookmarkQueryKeys.status(undefined, postId),
        { isBookmarked: true, bookmarkId: "optimistic" },
      );

      return { previousStatus, postId };
    },
    onError: (error, postId, context) => {
      // Revert optimistic update on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          bookmarkQueryKeys.status(undefined, postId),
          context.previousStatus,
        );
      }
      console.error("[BookmarkQueries] Error adding bookmark:", error);
    },
    onSuccess: (data, postId) => {
      // Legacy implementation - no cache updates needed
      if (process.env.NODE_ENV === "development") {
        console.log("[BookmarkQueries] Deprecated function called for", postId);
      }
    },
  });
}

/**
 * Hook for removing a bookmark with optimistic updates
 * Uses DELETE /api/bookmarks/[postId]
 */
export function useRemoveBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/bookmarks/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to remove bookmark: ${response.status}`,
        );
      }

      return response.json();
    },
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches for bookmark status
      await queryClient.cancelQueries({
        queryKey: bookmarkQueryKeys.status(undefined, postId),
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<BookmarkStatus>(
        bookmarkQueryKeys.status(undefined, postId),
      );

      // Optimistically update bookmark status
      queryClient.setQueryData<BookmarkStatus>(
        bookmarkQueryKeys.status(undefined, postId),
        { isBookmarked: false, bookmarkId: null },
      );

      return { previousStatus, postId };
    },
    onError: (error, postId, context) => {
      // Revert optimistic update on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          bookmarkQueryKeys.status(undefined, postId),
          context.previousStatus,
        );
      }
      console.error("[BookmarkQueries] Error removing bookmark:", error);
    },
    onSuccess: (data, postId) => {
      // Ensure bookmark status is updated
      queryClient.setQueryData<BookmarkStatus>(
        bookmarkQueryKeys.status(undefined, postId),
        { isBookmarked: false, bookmarkId: null },
      );

      // Invalidate user bookmarks list to remove the bookmark
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[BookmarkQueries] Successfully removed bookmark");
      }
    },
  });
}
