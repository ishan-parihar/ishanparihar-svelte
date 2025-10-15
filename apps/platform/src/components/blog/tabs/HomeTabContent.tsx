"use client";

import React from "react";
import { createClient } from "@/utils/supabase/client";
import {
  usePublicBlogPostsWithHelpers,
  type PublicBlogPost,
} from "@/queries/blogQueries";
import { BlogCardSkeleton } from "@/components/ui/loading-animations";
import { HorizontalBlogCard } from "@/components/blog/HorizontalBlogCard";
import { StaggeredList } from "@/components/motion";
import dynamic from "next/dynamic";

// Dynamic import for MagicBento to prevent SSR issues
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  ),
});

interface HomeTabContentProps {
  initialPosts?: PublicBlogPost[];
}

const HomeTabContent = ({ initialPosts = [] }: HomeTabContentProps) => {
  const supabase = createClient();

  // Fetch all posts for home tab
  const {
    data: allPosts,
    isLoading: isLoadingAllPosts,
    isFetching: isFetchingAllPosts,
  } = usePublicBlogPostsWithHelpers(supabase, undefined, true);

  // Use initial posts immediately if available and no fresh data yet
  const homeTabPosts = allPosts || initialPosts;

  const isLoading = isLoadingAllPosts && !initialPosts.length;
  const posts = homeTabPosts;
  const title = "All Posts";
  const emptyMessage = "No posts available";

  // Helper function to get blog cover image URL
  const getBlogImage = (post: PublicBlogPost): string => {
    return post.cover_image || "/default-blog-image.jpg";
  };

  // Transform posts to MagicBento card data
  const cardData = posts ? posts.map((post, index) => ({
    id: post.slug,
    content: (
      <HorizontalBlogCard
        key={post.slug}
        id={post.id}
        title={post.title}
        excerpt={post.excerpt}
        coverImage={getBlogImage(post)}
        date={post.date}
        category={post.category}
        slug={post.slug}
        index={index}
        premium={post.premium}
        likes_count={post.likes_count}
        comments_count={post.comments_count}
        views_count={post.views_count}
        content_type={post.content_type}
        recommendation_tags={post.recommendation_tags}
      />
    ),
    className: "border-0", // Remove border since MagicBento handles styling
  })) : [];

  return (
    <>
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <StaggeredList className="w-full" staggerDelay={0.02}>
          <MagicBento
            cards={cardData}
            className="space-y-0 divide-y divide-neutral-200/60 dark:divide-neutral-800/60"
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
        <div className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
            {emptyMessage}
          </h3>
        </div>
      )}
    </>
  );
};

export default HomeTabContent;
