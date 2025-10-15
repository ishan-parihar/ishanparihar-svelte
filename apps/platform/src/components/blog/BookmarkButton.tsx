"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Loader2 } from "lucide-react";
import { useAuthRequirement } from "@/hooks/useAuthRequirement";
import { toast } from "sonner";
import { api } from "@/lib/trpc-client";

interface BookmarkButtonProps {
  postId: string;
  postTitle?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BookmarkButton({
  postId,
  postTitle,
  className = "",
  disabled = false,
  showLabel = false,
  size = "md",
}: BookmarkButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    isAuthenticated,
    isLoading: authLoading,
    requireAuthForAction,
    getAuthStatusMessage,
  } = useAuthRequirement();

  // Use tRPC for bookmark operations
  const utils = api.useUtils();

  // Get user bookmarks to check if this post is bookmarked
  // Note: This is not the most efficient approach for checking bookmark status
  // TODO: Create a dedicated getBookmarkStatus procedure for better performance
  const { data: bookmarks, error: statusError } =
    api.user.getBookmarks.useQuery(
      { page: 1, limit: 100 }, // Reduced from 1000 to comply with tRPC validation
      { enabled: isAuthenticated },
    );

  const isBookmarked =
    bookmarks?.bookmarks.some((bookmark: any) => bookmark.post_id === postId) ||
    false;

  // Toggle bookmark mutation
  const toggleBookmarkMutation = api.blog.toggleBookmark.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.user.getBookmarks.cancel();
      const previousBookmarks = utils.user.getBookmarks.getData();

      // Update the cache optimistically
      utils.user.getBookmarks.setData({ page: 1, limit: 100 }, (old) => {
        if (!old) return old;

        if (isBookmarked) {
          // Remove bookmark
          return {
            ...old,
            bookmarks: old.bookmarks.filter((b: any) => b.post_id !== postId),
            total: old.total - 1,
          };
        } else {
          // Add bookmark (simplified - in real app you'd need full bookmark object)
          return {
            ...old,
            bookmarks: [
              ...old.bookmarks,
              {
                id: "temp-" + Date.now(),
                post_id: postId,
                user_id: "current-user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            total: old.total + 1,
          };
        }
      });

      return { previousBookmarks };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousBookmarks) {
        utils.user.getBookmarks.setData(
          { page: 1, limit: 100 },
          context.previousBookmarks,
        );
      }
      toast.error("Failed to update bookmark");
    },
    onSuccess: (data) => {
      const title = postTitle || "Post";
      toast.success(data.bookmarked ? `${title} bookmarked.` : `${title} removed from bookmarks.`);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.user.getBookmarks.invalidate();
    },
  });

  const isLoading = toggleBookmarkMutation.isPending;

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: "w-4 h-4",
      button: "p-1.5",
      text: "text-xs",
    },
    md: {
      icon: "w-5 h-5",
      button: "p-2",
      text: "text-sm",
    },
    lg: {
      icon: "w-6 h-6",
      button: "p-3",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    // Prevent event propagation to parent elements
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading) return;

    // Check authentication first
    if (!isAuthenticated) {
      requireAuthForAction(
        () => {
          // This will be called after successful authentication
          // Create a mock event object for the recursive call
          const mockEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent;
          handleBookmarkToggle(mockEvent);
        },
        {
          message: "Sign in to bookmark this post",
          view: "signIn",
        },
      );
      return;
    }

    setIsAnimating(true);

    try {
      await toggleBookmarkMutation.mutateAsync({ postId });
    } catch (error) {
      console.error("Error toggling bookmark:", error);

      // Handle authentication errors
      if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
        requireAuthForAction(
          () => {
            // Retry the bookmark action after authentication
            // Create a mock event object for the recursive call
            const mockEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent;
            handleBookmarkToggle(mockEvent);
          },
          {
            message:
              "Your session has expired. Please sign in again to bookmark this post",
            view: "signIn",
          },
        );
      } else {
        toast.error(
          isBookmarked
            ? "Failed to remove bookmark"
            : "Failed to bookmark post",
        );
      }
    } finally {
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Show error state if there's an error loading bookmark status
  if (statusError && !authLoading) {
    return (
      <button
        className={`
          flex items-center gap-1 ${config.button} rounded-none border border-neutral-200 dark:border-neutral-800
          bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed
          ${className}
        `}
        disabled
        title="Unable to load bookmark status"
      >
        <Bookmark className={config.icon} />
        {showLabel && <span className={config.text}>Error</span>}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleBookmarkToggle}
        disabled={disabled || isLoading || authLoading}
        className={`
          flex items-center gap-1 ${config.button} rounded-none border border-neutral-200 dark:border-neutral-800
          hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isBookmarked
              ? "bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
              : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400"
          }
          ${isLoading ? "cursor-wait" : "cursor-pointer"}
        `}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        animate={
          isAnimating
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{ duration: 0.2 }}
        title={
          authLoading
            ? "Loading..."
            : isAuthenticated
              ? isBookmarked
                ? "Remove bookmark"
                : "Bookmark this post"
              : getAuthStatusMessage("bookmark this post")
        }
      >
        {/* Bookmark Icon with Animation */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className={`${config.icon} animate-spin`} />
            </motion.div>
          ) : (
            <motion.div
              key={isBookmarked ? "bookmarked" : "not-bookmarked"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isBookmarked ? (
                <Bookmark className={`${config.icon} fill-current`} />
              ) : (
                <Bookmark className={config.icon} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label */}
        {showLabel && (
          <motion.span
            className={`font-medium ${config.text}`}
            key={isBookmarked ? "bookmarked-text" : "bookmark-text"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? "..." : isBookmarked ? "Bookmarked" : "Bookmark"}
          </motion.span>
        )}

        {/* Auth prompt for unauthenticated users */}
        {!isAuthenticated && !authLoading && showLabel && (
          <span
            className={`${config.text} text-neutral-500 dark:text-neutral-400 ml-1`}
          >
            (Sign in)
          </span>
        )}
      </motion.button>

      {/* Tooltip for authentication status */}
      {!isAuthenticated && !authLoading && !showLabel && (
        <AnimatePresence>
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black text-xs rounded-none whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            Sign in to bookmark
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
