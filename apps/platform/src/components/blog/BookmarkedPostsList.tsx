"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Loader2, Heart, RefreshCw, Filter, BookOpen } from "lucide-react";
import { useUserBookmarks, UserBookmark } from "@/queries/bookmarkQueries";
import { MediumBlogCard } from "@/components/blog/MediumBlogCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface BookmarkedPostsListProps {
  className?: string;
}

export function BookmarkedPostsList({
  className = "",
}: BookmarkedPostsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentOffset, setCurrentOffset] = useState(0);
  const limit = 10;

  const {
    data: bookmarksData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useUserBookmarks({
    limit,
    offset: currentOffset,
    category: selectedCategory || undefined,
    enabled: true,
  });

  // Memoize bookmarks to prevent unnecessary re-renders
  const bookmarks = React.useMemo(() => {
    return bookmarksData?.bookmarks || [];
  }, [bookmarksData?.bookmarks]);

  const total = bookmarksData?.total || 0;
  const hasMore = currentOffset + limit < total;
  const hasPrevious = currentOffset > 0;

  // Extract unique categories from bookmarks for filter
  const categories = React.useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return [];

    const categorySet = new Set<string>();
    bookmarks.forEach((bookmark) => {
      if (bookmark.blog_post.category) {
        categorySet.add(bookmark.blog_post.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [bookmarks]);

  const handleLoadMore = () => {
    setCurrentOffset((prev) => prev + limit);
  };

  const handleLoadPrevious = () => {
    setCurrentOffset((prev) => Math.max(0, prev - limit));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentOffset(0); // Reset to first page when changing category
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-neutral-600 dark:text-neutral-400 mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          Loading your bookmarks...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={`border border-red-200 dark:border-red-800 ${className}`}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Failed to Load Bookmarks
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4 max-w-md">
              We couldn't load your bookmarked posts. Please try again.
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!bookmarks.length) {
    return (
      <Card
        className={`border border-neutral-200 dark:border-neutral-800 ${className}`}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No Bookmarks Yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
              {selectedCategory
                ? `No bookmarked posts found in the "${selectedCategory}" category.`
                : "Start bookmarking posts you want to read later. They'll appear here for easy access."}
            </p>
            {selectedCategory && (
              <Button
                onClick={() => handleCategoryChange("")}
                variant="outline"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters and stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Your Bookmarks
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {total} {total === 1 ? "post" : "posts"} bookmarked
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          {categories.length > 0 && (
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Active filter indicator */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {selectedCategory}
            <button
              onClick={() => handleCategoryChange("")}
              className="ml-1 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* Bookmarked Posts List */}
      <motion.div
        className="space-y-0"
        variants={staggerContainer as Variants}
        initial="initial"
        animate="animate"
      >
        {bookmarks.map((bookmark, index) => (
          <motion.div
            key={bookmark.id}
            variants={fadeUp as Variants}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <MediumBlogCard
              id={bookmark.blog_post.id}
              title={bookmark.blog_post.title}
              excerpt={bookmark.blog_post.excerpt}
              coverImage={bookmark.blog_post.cover_image || ""}
              date={bookmark.blog_post.date}
              category={bookmark.blog_post.category}
              slug={bookmark.blog_post.slug}
              premium={bookmark.blog_post.premium}
              author={bookmark.blog_post.author}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {(hasMore || hasPrevious) && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <Button
            onClick={handleLoadPrevious}
            disabled={!hasPrevious || isFetching}
            variant="outline"
          >
            Previous
          </Button>

          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {currentOffset + 1}-{Math.min(currentOffset + limit, total)}{" "}
            of {total}
          </span>

          <Button
            onClick={handleLoadMore}
            disabled={!hasMore || isFetching}
            variant="outline"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
