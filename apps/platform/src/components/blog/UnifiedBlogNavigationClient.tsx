"use client";

import { Suspense, useEffect } from "react";
import UnifiedBlogNavigation from "./UnifiedBlogNavigation";

// Skeleton loader for the unified navigation - COORDINATED SCROLL BEHAVIOR
function UnifiedBlogNavigationSkeleton() {
  return (
    <div className="h-[150px] mt-[70px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Search Bar Skeleton */}
          <div className="w-full max-w-2xl mx-auto mb-4">
            <div className="relative w-full h-10 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-none animate-pulse"></div>
          </div>

          {/* Categories Skeleton */}
          <div className="flex items-center overflow-x-auto py-2 gap-3 no-scrollbar relative">
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none z-10 md:hidden"></div>

            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-none animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UnifiedBlogNavigationClientProps {
  categories: string[];
  staticCategories?: { name: string; href: string }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export default function UnifiedBlogNavigationClient({
  categories,
  staticCategories,
  activeTab = "home",
  onTabChange,
  onSearch,
}: UnifiedBlogNavigationClientProps) {
  // Filter out "All Categories" if it exists
  const filteredCategories = categories.filter(
    (cat) => cat !== "All Categories",
  );

  // Always include Home, Featured and Following as static categories
  const standardStaticCategories = [
    { name: "Home", href: "/blog" },
    { name: "Featured", href: "/blog/featured" },
    { name: "Following", href: "/blog/following" },
  ];

  // Initialize blog navigation positioning on mount
  useEffect(() => {
    const blogNav = document.querySelector('.blog-navigation-container');
    if (blogNav) {
      const blogNavElement = blogNav as HTMLElement;
      // Ensure initial positioning is correct
      blogNavElement.style.transform = 'translateY(0)';
      blogNavElement.style.opacity = '1';
    }
  }, []);

  return (
    <div className="blog-navigation-container fixed top-0 left-0 right-0 z-40 w-full transition-all duration-400 ease-in-out">
      {/* Extended dark background that fills the gap with header */}
      <div className="absolute inset-0 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 shadow-sm"></div>

      {/* Content container positioned at the bottom */}
      <div className="relative mt-[70px]">
        <Suspense fallback={<UnifiedBlogNavigationSkeleton />}>
          <UnifiedBlogNavigation
            categories={filteredCategories}
            staticCategories={standardStaticCategories}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onSearch={onSearch}
          />
        </Suspense>
      </div>
    </div>
  );
}
