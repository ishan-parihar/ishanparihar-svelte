"use client";

import React from "react";
import { createClient } from "@/utils/supabase/client";
import { useFeaturedBlogPostsWithHelpers } from "@/queries/blogQueries";
import { BlogCardSkeleton } from "@/components/ui/loading-animations";
import dynamic from "next/dynamic";
import { transformPostsToCardData } from "@/lib/data-adapter";
import { StaggeredList } from "@/components/motion";

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

const FeaturedTabContent = () => {
  const supabase = createClient();

  // Fetch featured posts for featured tab
  const {
    data: featuredPosts,
    isLoading: isLoadingFeatured,
    isFetching: isFetchingFeatured,
  } = useFeaturedBlogPostsWithHelpers(supabase, 5, true);

  const isLoading = isLoadingFeatured;
  const posts = featuredPosts || [];
  const title = "Featured Posts";
  const emptyMessage = "No featured posts available";

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
        <StaggeredList className="w-full" staggerDelay={0.1}>
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
        </StaggeredList>
      ) : (
        <div className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-border backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
            {emptyMessage}
          </h3>
        </div>
      )}
    </>
  );
};

export default FeaturedTabContent;
