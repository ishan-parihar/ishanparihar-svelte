"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { useAuthRequirement } from "@/hooks/useAuthRequirement";
import {
  useLikeBlogPostMutation,
  useBlogEngagementWithHelpers,
} from "@/queries/blogQueries";
import { createClient } from "@/utils/supabase/client";

interface EngagementMetricsProps {
  slug: string;
  initialLikesCount?: number;
  initialCommentsCount?: number;
  initialViewsCount?: number;
  showLiking?: boolean;
  onCommentsClick?: () => void;
  className?: string;
  onEngagementUpdate?: (
    likes: number,
    comments: number,
    views?: number,
  ) => void;
}

export function EngagementMetrics({
  slug,
  initialLikesCount = 0,
  initialCommentsCount = 0,
  initialViewsCount = 0,
  showLiking = true,
  onCommentsClick,
  className = "",
  onEngagementUpdate,
}: EngagementMetricsProps) {
  const [isLiking, setIsLiking] = useState(false);

  const supabase = createClient();

  const {
    isAuthenticated,
    isLoading: authLoading,
    requireAuthForAction,
    getAuthStatusMessage,
  } = useAuthRequirement();

  // Use the new engagement query hook for real-time data
  const { data: engagementData, isLoading: engagementLoading } =
    useBlogEngagementWithHelpers(supabase, slug, true);

  // Use the new like mutation hook
  const likeMutation = useLikeBlogPostMutation(supabase);

  // Get current counts from query data or fallback to initial values
  const likesCount =
    engagementData?.blog_engagement?.[0]?.likes_count ?? initialLikesCount;
  const commentsCount = initialCommentsCount; // Comments count comes from props, not blog_engagement table
  const viewsCount =
    engagementData?.blog_engagement?.[0]?.views_count ?? initialViewsCount;

  // Notify parent component when engagement data changes
  useEffect(() => {
    const engagement = engagementData?.blog_engagement?.[0];
    if (engagement) {
      onEngagementUpdate?.(
        engagement.likes_count,
        commentsCount,
        engagement.views_count,
      );
    }
  }, [engagementData?.blog_engagement, commentsCount, onEngagementUpdate]);

  const handleLike = async () => {
    if (!showLiking || authLoading) return;

    // Require authentication for liking
    if (!isAuthenticated) {
      requireAuthForAction(
        () => {
          // This will be called after successful authentication
          handleLike();
        },
        {
          message: "Sign in to like this post",
          view: "signIn",
        },
      );
      return;
    }

    setIsLiking(true);

    try {
      await likeMutation.mutateAsync({ slug, increment: 1 });
    } catch (error) {
      console.error("Error incrementing likes:", error);

      // Handle authentication errors
      if (error instanceof Error && error.message.includes("401")) {
        requireAuthForAction(() => handleLike(), {
          message:
            "Your session has expired. Please sign in again to like this post",
          view: "signIn",
        });
      }
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  };

  const handleCommentsClick = () => {
    if (onCommentsClick) {
      onCommentsClick();
    } else {
      // Default behavior: scroll to comments section
      const commentsSection = document.querySelector(".comments-section");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className={`flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 ${className}`}
    >
      {/* Like Button */}
      {showLiking && (
        <motion.button
          onClick={handleLike}
          disabled={authLoading}
          className={`flex items-center gap-1 transition-colors duration-200 disabled:opacity-50 ${
            isAuthenticated
              ? "hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              : "hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isLiking ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          title={
            authLoading
              ? "Loading..."
              : isAuthenticated
                ? "Like this post"
                : getAuthStatusMessage("like this post")
          }
        >
          <motion.div
            className="flex items-center"
            animate={
              isLiking
                ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.div>
          <span className="font-medium">{likesCount}</span>
          {!isAuthenticated && !authLoading && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
              (Sign in)
            </span>
          )}
        </motion.button>
      )}

      {/* Comments Button */}
      <button
        onClick={handleCommentsClick}
        className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
        title="View comments"
      >
        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{commentsCount}</span>
      </button>

      {/* Views Display */}
      <div className="flex items-center gap-1" title="Views">
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{viewsCount}</span>
      </div>
    </div>
  );
}

// Static version for server-side rendering or when interactivity is not needed
interface StaticEngagementMetricsProps {
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  className?: string;
}

export function StaticEngagementMetrics({
  likesCount,
  commentsCount,
  viewsCount = 0,
  className = "",
}: StaticEngagementMetricsProps) {
  // Extract gap class from className if provided, default to gap-4
  const gapClass = className.includes("gap-")
    ? className.split(" ").find((cls) => cls.startsWith("gap-")) || "gap-4"
    : "gap-4";

  // Remove gap class from className to avoid duplication
  const otherClasses = className.replace(/gap-\S+/g, "").trim();

  return (
    <div
      className={`flex items-center ${gapClass} text-sm text-neutral-600 dark:text-neutral-400 ${otherClasses}`}
    >
      {/* Static Like Display */}
      <div className="flex items-center gap-1">
        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{likesCount}</span>
      </div>

      {/* Static Comments Display */}
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{commentsCount}</span>
      </div>

      {/* Static Views Display */}
      <div className="flex items-center gap-1">
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{viewsCount}</span>
      </div>
    </div>
  );
}
