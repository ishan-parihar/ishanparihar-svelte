"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuthRequirement } from "@/hooks/useAuthRequirement";
import { api } from "@/lib/trpc-client";

interface LikeButtonProps {
  slug: string;
  initialCount?: number;
  onCountChange?: (newCount: number) => void;
  className?: string;
  disabled?: boolean;
}

export function LikeButton({
  slug,
  initialCount = 0,
  onCountChange,
  className = "",
  disabled = false,
}: LikeButtonProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [pendingLikes, setPendingLikes] = useState(0);
  const [optimisticCount, setOptimisticCount] = useState(0);

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingLikeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isAuthenticated,
    isLoading: authLoading,
    requireAuthForAction,
    getAuthStatusMessage,
  } = useAuthRequirement();

  // Get blog post data to get the post ID
  const { data: post } = api.blog.getPost.useQuery({ slug });

  // Use tRPC for like operations
  const likeMutation = api.blog.toggleLike.useMutation({
    onSuccess: (data) => {
      setOptimisticCount(0); // Reset optimistic count since server has the real count
      onCountChange?.(data.likes_count);
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    },
  });

  // Get current count from post data or fallback to initial count
  const serverCount = post?.likes_count ?? initialCount;
  const currentCount = serverCount + optimisticCount;

  // Notify parent component when count changes
  useEffect(() => {
    const likesCount = currentCount;
    if (likesCount !== undefined) {
      onCountChange?.(likesCount);
    }
  }, [currentCount, onCountChange]);

  // Reset optimistic count when server data changes
  useEffect(() => {
    setOptimisticCount(0);
  }, [serverCount]);

  const sendLikesToServer = useCallback(
    async (likeCount: number) => {
      if (likeCount === 0) return;

      try {
        // Optimistically update the count immediately
        setOptimisticCount((prev) => prev + likeCount);

        // Use tRPC mutation - note: toggleLike increments by 1, so we need to call it likeCount times
        // Use the post ID from the fetched post data
        if (!post?.id) {
          throw new Error("Post ID not available");
        }

        for (let i = 0; i < likeCount; i++) {
          await likeMutation.mutateAsync({ postId: post.id });
        }

        // Reset optimistic count after successful server response
        setOptimisticCount(0);
      } catch (error) {
        console.error("Error incrementing likes:", error);

        // Revert optimistic update on error
        setOptimisticCount((prev) => prev - likeCount);

        // Handle authentication errors
        if (error instanceof Error && error.message.includes("401")) {
          requireAuthForAction(
            () => {
              // Retry the like after authentication
              sendLikesToServer(likeCount);
            },
            {
              message:
                "Your session has expired. Please sign in again to like this post",
              view: "signIn",
            },
          );
        }
      }
    },
    [post?.id, likeMutation, requireAuthForAction],
  );

  const handleSingleLike = useCallback(() => {
    if (disabled || authLoading) return;

    // Check authentication first
    if (!isAuthenticated) {
      requireAuthForAction(
        () => {
          // This will be called after successful authentication
          handleSingleLike();
        },
        {
          message: "Sign in to like this post",
          view: "signIn",
        },
      );
      return;
    }

    // Add to pending likes for batching
    setPendingLikes((prev) => prev + 1);
    setIsLiking(true);

    // Clear existing timeout
    if (pendingLikeTimeoutRef.current) {
      clearTimeout(pendingLikeTimeoutRef.current);
    }

    // Send to server after a short delay to batch multiple likes
    pendingLikeTimeoutRef.current = setTimeout(() => {
      sendLikesToServer(pendingLikes + 1);
      setPendingLikes(0);
    }, 500);

    // Reset liking animation
    setTimeout(() => setIsLiking(false), 300);
  }, [
    disabled,
    authLoading,
    isAuthenticated,
    requireAuthForAction,
    pendingLikes,
    sendLikesToServer,
  ]);

  const startHolding = useCallback(() => {
    if (disabled || authLoading || !isAuthenticated) return;

    setIsHolding(true);

    // Start continuous liking after a short delay
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        setPendingLikes((prev) => prev + 1);
        setIsLiking(true);

        setTimeout(() => setIsLiking(false), 150);
      }, 200); // Like every 200ms while holding
    }, 300); // Start continuous liking after 300ms hold
  }, [disabled, authLoading, isAuthenticated]);

  const stopHolding = useCallback(() => {
    setIsHolding(false);

    // Clear timeouts and intervals
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    // Send accumulated likes to server
    if (pendingLikes > 0) {
      // Clear existing timeout
      if (pendingLikeTimeoutRef.current) {
        clearTimeout(pendingLikeTimeoutRef.current);
      }

      sendLikesToServer(pendingLikes);
      setPendingLikes(0);
    }
  }, [pendingLikes, sendLikesToServer]);

  const handleMouseDown = useCallback(() => {
    handleSingleLike();
    startHolding();
  }, [handleSingleLike, startHolding]);

  const handleMouseUp = useCallback(() => {
    stopHolding();
  }, [stopHolding]);

  const handleMouseLeave = useCallback(() => {
    stopHolding();
  }, [stopHolding]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (pendingLikeTimeoutRef.current)
        clearTimeout(pendingLikeTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-none border border-neutral-200 dark:border-neutral-800
          hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isHolding ? "bg-neutral-100 dark:bg-neutral-800" : "bg-white dark:bg-black"}
          cursor-pointer
        `}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        animate={
          isLiking
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{ duration: 0.2 }}
      >
        {/* Like Icon with Animation */}
        <motion.div
          className="flex items-center select-none"
          animate={
            isLiking
              ? {
                  rotate: [0, -15, 15, -10, 0],
                  scale: [1, 1.3, 1],
                }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <Heart className="w-5 h-5" />
        </motion.div>

        {/* Count Display */}
        <motion.span
          className="font-medium text-neutral-900 dark:text-white min-w-[20px] text-center"
          key={currentCount}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.2 }}
        >
          {currentCount + pendingLikes}
        </motion.span>
      </motion.button>

      {/* Hold Indicator */}
      <AnimatePresence>
        {isHolding && (
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black text-xs rounded-none whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            Hold to keep liking!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Likes Indicator */}
      <AnimatePresence>
        {pendingLikes > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            {pendingLikes}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
