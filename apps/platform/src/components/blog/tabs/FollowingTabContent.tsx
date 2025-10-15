"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/utils/supabase/client";
import { useFollowingPostsWithHelpers } from "@/queries/blogQueries";
import { BlogCardSkeleton } from "@/components/ui/loading-animations";
import dynamic from "next/dynamic";
import { transformPostsToCardData } from "@/lib/data-adapter";

// Dynamic import for MagicBento to prevent SSR issues
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  ),
});

const FollowingTabContent = () => {
  const { data: session } = useSession();
  const supabase = createClient();

  // Fetch following posts for following tab (only if user is logged in)
  const {
    data: followingPosts,
    isLoading: isLoadingFollowing,
    isFetching: isFetchingFollowing,
  } = useFollowingPostsWithHelpers(
    supabase,
    session?.user?.id || "",
    !!session?.user?.id,
  );

  if (!session?.user) {
    return (
      <div className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
        <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
          Please sign in to see posts from topics you follow
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Sign in to follow topics and see personalized content
        </p>
      </div>
    );
  }

  const isLoading = isLoadingFollowing;
  const posts = followingPosts || [];
  const title = "Following";
  const emptyMessage =
    "No posts from your followed topics. Follow some categories to see personalized content here.";

  // Transform posts to card data for MagicBento
  const cardData =
    posts && posts.length > 0 ? transformPostsToCardData(posts) : [];

  return (
    <>
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="w-full">
          <MagicBento
            cards={cardData}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            clickEffect={true}
            enableMagnetism={true}
          />
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
            {emptyMessage}
          </h3>
        </div>
      )}
    </>
  );
};

export default FollowingTabContent;
