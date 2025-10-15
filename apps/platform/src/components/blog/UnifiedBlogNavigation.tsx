"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CategoryLinks from "./CategoryLinks";
import { BookmarksTab } from "./BookmarksTab";
import { useNavigationLoading } from "@/hooks/useLoadingStates";

interface UnifiedBlogNavigationProps {
  categories: string[];
  staticCategories: { name: string; href: string }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export default function UnifiedBlogNavigation({
  categories,
  staticCategories,
  activeTab = "home",
  onTabChange,
  onSearch,
}: UnifiedBlogNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      if (onSearch) {
        // Use tab-based search if callback is provided
        onSearch(trimmedQuery);
      } else {
        // Fallback to navigation-based search
        startNavigation("Searching...", "dots");
        router.push(`/blog/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    } else {
      // Clear search or go to home tab
      if (onTabChange) {
        onTabChange("home");
      } else {
        startNavigation("Loading blog...", "default");
        router.push("/blog");
      }
    }
  };

  return (
    <div className="blog-navigation w-full h-[150px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Combined search and categories in a unified container */}
        <div className="py-4">
          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl mx-auto mb-4"
          >
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-200" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 bg-transparent border-neutral-200/60 dark:border-neutral-800/60 focus:border-neutral-300 dark:focus:border-neutral-700 focus:ring-1 focus:ring-neutral-300/30 dark:focus:ring-neutral-700/30 transition-all duration-200 rounded-none h-10 hover:border-neutral-300/70 dark:hover:border-neutral-700/70 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Categories and Bookmarks Layout */}
          <div className="flex items-center gap-4">
            {/* Scrollable Categories Section */}
            <div className="flex-1 overflow-x-auto py-2 no-scrollbar relative">
              {/* Fade effect for horizontal scroll indication */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none z-10"></div>

              <div className="flex items-center gap-3 pr-12">
                <CategoryLinks
                  categories={categories}
                  staticCategories={staticCategories}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                />
              </div>
            </div>

            {/* Fixed Bookmarks Button */}
            <div className="flex-shrink-0 pl-4 border-l border-neutral-200 dark:border-neutral-800">
              <BookmarksTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
