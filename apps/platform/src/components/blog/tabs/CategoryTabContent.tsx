"use client";

import React from "react";
import { createClient } from "@/utils/supabase/client";
import {
  useBlogPostsByCategoryWithHelpers,
  useBlogCategoriesWithHelpers,
} from "@/queries/blogQueries";
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

interface CategoryTabContentProps {
  activeTab: string;
  searchQuery?: string;
}

const CategoryTabContent = ({
  activeTab,
  searchQuery = "",
}: CategoryTabContentProps) => {
  const supabase = createClient();

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useBlogCategoriesWithHelpers(supabase);

  // Ensure categories is always an array of strings
  const categories = Array.isArray(categoriesData)
    ? categoriesData.filter((cat) => typeof cat === "string")
    : [];

  // Determine if this is a static tab or category tab
  const isStaticTab =
    activeTab === "home" ||
    activeTab === "featured" ||
    activeTab === "following" ||
    activeTab === "search";
  const selectedCategory = !isStaticTab
    ? categories.find(
        (cat) => typeof cat === "string" && cat.toLowerCase() === activeTab,
      )
    : null;

  // Fetch category-specific posts (only for category tabs)
  const {
    data: categoryPosts,
    isLoading: isLoadingCategory,
    isFetching: isFetchingCategory,
  } = useBlogPostsByCategoryWithHelpers(
    supabase,
    selectedCategory || "",
    !!selectedCategory && !searchQuery,
  );

  // If no selected category, don't render anything
  if (!selectedCategory) {
    return null;
  }

  const isLoading = isLoadingCategory;
  const posts = categoryPosts || [];
  const title = `${selectedCategory} Posts`;
  const emptyMessage = `No posts found in ${selectedCategory} category`;

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
        <div className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
            {emptyMessage}
          </h3>
        </div>
      )}
    </>
  );
};

export default CategoryTabContent;
