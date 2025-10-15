"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createAnonymousClient } from "@/utils/supabase/static";
import { type PublicBlogPost } from "@/queries/blogQueries";
import dynamic from "next/dynamic";
import UnifiedBlogNavigationClient from "./UnifiedBlogNavigationClient";
import { BlogSidebarClient } from "./BlogSidebarClient";

// Import the skeleton component statically for loading states
import TabContentSkeleton from "./tabs/TabContentSkeleton";

// Dynamic imports for tab content components
const DynamicHomeTab = dynamic(() => import("./tabs/HomeTabContent"), {
  loading: () => <TabContentSkeleton />,
});

const DynamicFeaturedTab = dynamic(() => import("./tabs/FeaturedTabContent"), {
  loading: () => <TabContentSkeleton />,
});

const DynamicFollowingTab = dynamic(
  () => import("./tabs/FollowingTabContent"),
  {
    loading: () => <TabContentSkeleton />,
  },
);

const DynamicCategoryTab = dynamic(() => import("./tabs/CategoryTabContent"), {
  loading: () => <TabContentSkeleton />,
});

const DynamicSearchTab = dynamic(() => import("./tabs/SearchTabContent"), {
  loading: () => <TabContentSkeleton />,
});

interface UnifiedBlogPageClientProps {
  initialPosts?: PublicBlogPost[];
  initialCategories?: string[];
  initialFeaturedPosts?: PublicBlogPost[];
}

const UnifiedBlogPageClientComponent = ({
  initialPosts = [],
  initialCategories = [],
  initialFeaturedPosts = [],
}: UnifiedBlogPageClientProps) => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const supabase = createAnonymousClient();

  // Use categories from props (server-fetched data) instead of client-side fetching
  // Ensure categories is always an array of strings
  const categories = Array.isArray(initialCategories)
    ? initialCategories.filter((cat) => typeof cat === "string")
    : [];

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery(""); // Clear search when changing tabs
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("search"); // Switch to search mode
  };

  // Determine the title for the current tab
  const getTabTitle = () => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }

    switch (activeTab) {
      case "featured":
        return "Featured Posts";
      case "following":
        return "Following";
      case "home":
        return "All Posts";
      case "search":
        return `Search results for "${searchQuery}"`;
      default:
        // Handle category tabs
        const isStaticTab =
          activeTab === "home" ||
          activeTab === "featured" ||
          activeTab === "following" ||
          activeTab === "search";
        if (!isStaticTab) {
          const selectedCategory = categories.find(
            (cat) => typeof cat === "string" && cat.toLowerCase() === activeTab,
          );
          if (selectedCategory) {
            return `${selectedCategory} Posts`;
          }
        }
        return "All Posts";
    }
  };

  const title = getTabTitle();

  return (
    <section className="w-full flex flex-col pt-[220px]">
      <UnifiedBlogNavigationClient
        categories={categories}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
      />

      {/* Content below the header */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
          {/* Main content area - ~70% width */}
          <div className="flex-1 min-w-0 lg:max-w-none lg:w-[70%]">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">
              {title}
            </h1>

            {/* Content - Dynamically loaded based on active tab */}
            {searchQuery ? (
              <DynamicSearchTab searchQuery={searchQuery} />
            ) : activeTab === "home" ? (
              <DynamicHomeTab initialPosts={initialPosts} />
            ) : activeTab === "featured" ? (
              <DynamicFeaturedTab />
            ) : activeTab === "following" ? (
              <DynamicFollowingTab />
            ) : (
              <DynamicCategoryTab
                activeTab={activeTab}
                searchQuery={searchQuery}
              />
            )}

            {/* Mobile sidebar */}
            <div className="block lg:hidden mt-12">
              <div className="blog-sidebar">
                <BlogSidebarClient featuredPosts={initialFeaturedPosts} />
              </div>
            </div>
          </div>

          {/* Desktop sidebar - ~30% width */}
          <div className="hidden lg:block mt-12 lg:mt-0 lg:w-[30%] lg:flex-shrink-0 lg:self-start">
            <div className="blog-sidebar">
              <BlogSidebarClient featuredPosts={initialFeaturedPosts} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(UnifiedBlogPageClientComponent);
