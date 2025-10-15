"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Loader2, Filter, BookOpen, RefreshCw, Share2 } from "lucide-react";
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
import { useUserBookmarks, UserBookmark } from "@/queries/bookmarkQueries";
import { MediumBlogCard } from "./MediumBlogCard";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import { toast } from "sonner";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

interface CompactBlogCardProps {
  id?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  category: string;
  slug: string;
  index?: number;
  premium?: boolean;
  author?: string;
}

// Blog card component that matches the main blog listing style
function CompactBlogCard({
  id,
  title,
  excerpt,
  coverImage,
  date,
  category,
  slug,
  index = 0,
  premium = false,
  author = "Anonymous",
}: CompactBlogCardProps) {
  const formattedDate = formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });

  // Helper function to get blog cover image URL with simple URL pattern fixing
  const getBlogImage = (coverImageUrl?: string): string => {
    // Prioritize cover_image first as it's the format stored in Supabase,
    // then fallback to coverImage if it exists, otherwise use default
    let imageUrl = coverImageUrl || "/default-blog-image.jpg";

    // Validate URL before returning
    try {
      // Check if it's already a valid URL or a relative path
      if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
        // FALLBACK FIX: Fix problematic URL patterns directly in the component
        // This is only a fallback in case the server-side fix in getImagePublicUrl didn't catch all cases
        if (imageUrl.includes("/blog-images/blog/public/")) {
          const fixedUrl = imageUrl.replace(
            "/blog-images/blog/public/",
            "/blog-images/public/",
          );
          imageUrl = fixedUrl;
        } else if (imageUrl.includes("/blog-images/blog/")) {
          const fixedUrl = imageUrl.replace(
            "/blog-images/blog/",
            "/blog-images/",
          );
          imageUrl = fixedUrl;
        }
        return imageUrl;
      } else {
        // If it's not a valid URL or relative path, use default image
        return "/default-blog-image.jpg";
      }
    } catch (error) {
      console.error(`Error processing image URL: "${imageUrl}"`, error);
      return "/default-blog-image.jpg";
    }
  };

  const imageSrc = getBlogImage(coverImage);

  // Get author display name
  const authorName = author || "Anonymous";

  // Get author avatar URL
  const getAuthorAvatarUrl = () => {
    // Generate a deterministic avatar based on author name
    const seed = authorName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6ccfe,c9b6fb,f5c6ff&backgroundType=gradientLinear`;
  };

  // Get author initials for fallback
  const getAuthorInitials = () => {
    return authorName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      className="group CompactBlogCard"
      variants={fadeUp as Variants}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <LinkLoadingWrapper
        href={`/blog/${slug}`}
        showIndicator={true}
        className="block"
      >
        <article className="flex flex-row gap-3 sm:gap-4 py-4 sm:py-6 px-0 transition-all duration-200 border-b border-neutral-200/60 dark:border-neutral-800/60 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
          {/* Left: Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-1.5 sm:space-y-2">
              {/* Category info */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                  {category}
                </span>
                <span>·</span>
                <span>{formattedDate}</span>
                {premium && (
                  <>
                    <span>·</span>
                    <Badge
                      variant="default"
                      className="font-medium text-xs px-2 py-0.5 flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Premium
                    </Badge>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg md:text-xl font-bold group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 line-clamp-2 text-neutral-900 dark:text-white leading-tight">
                {title}
              </h2>

              {/* Excerpt */}
              <p className="line-clamp-2 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-400 mt-1.5 sm:mt-2">
                {excerpt}
              </p>

              {/* Author and Engagement Metrics */}
              <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 flex items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-neutral-200 dark:border-neutral-700">
                    <AvatarImage
                      src={getAuthorAvatarUrl()}
                      alt={authorName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs">
                      {getAuthorInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    {authorName}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Share Button */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const shareData = {
                        title: title,
                        text: excerpt,
                        url: `${window.location.origin}/blog/${slug}`,
                      };

                      try {
                        if (
                          navigator.share &&
                          navigator.canShare &&
                          navigator.canShare(shareData)
                        ) {
                          await navigator.share(shareData);
                          toast.success("Post shared successfully!");
                        } else {
                          await navigator.clipboard.writeText(shareData.url);
                          toast.success("Link copied to clipboard!");
                        }
                      } catch (error) {
                        // Fallback to clipboard if share fails
                        try {
                          await navigator.clipboard.writeText(shareData.url);
                          toast.success("Link copied to clipboard!");
                        } catch (clipboardError) {
                          console.error(
                            "Failed to share or copy link:",
                            clipboardError,
                          );
                          toast.error(
                            "Failed to share post. Please try again.",
                          );
                        }
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
                    title="Share post"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Bookmark Button */}
                  {id && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <DynamicBookmarkButton
                        postId={id}
                        postTitle={title}
                        size="sm"
                        className="ml-0.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image - maintains 3:2 aspect ratio */}
          <div className="w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0 self-center">
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-sm">
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                priority={index < 3}
              />
            </div>
          </div>
        </article>
      </LinkLoadingWrapper>
    </motion.div>
  );
}

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarksModal({ isOpen, onClose }: BookmarksModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentOffset, setCurrentOffset] = useState(0);
  const limit = 10;
  const queryClient = useQueryClient();
  const router = useRouter();

  // Enhanced modal dismissal handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Enhanced modal behavior with proper body scroll lock and mobile support
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);

      // Enhanced body scroll lock with mobile support
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Store scroll position for restoration
      document.body.setAttribute("data-scroll-y", scrollY.toString());
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);

      // Restore body scroll and position
      const scrollY = document.body.getAttribute("data-scroll-y");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
        document.body.removeAttribute("data-scroll-y");
      }
    };
  }, [isOpen, handleClose]);

  // Handle browser back button (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      handleClose();
    };

    // Push a dummy state when modal opens
    window.history.pushState({ modalOpen: true }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up the dummy state if modal is still open
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, handleClose]);

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
    enabled: isOpen, // Only fetch when modal is open
  });

  // Refresh bookmarks when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      // Invalidate and refetch bookmarks when modal opens
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });
      // Small delay to ensure any pending mutations are complete
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [isOpen, queryClient, refetch]);

  // Listen for focus events to refresh bookmarks when user returns to tab
  useEffect(() => {
    if (isOpen) {
      const handleFocus = () => {
        refetch();
      };

      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [isOpen, refetch]);

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
    setCurrentOffset(0); // Reset pagination when changing category
  };

  const handleRefresh = () => {
    refetch();
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedCategory("");
      setCurrentOffset(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-none md:rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col"
          style={{
            height: "auto",
            maxHeight: "calc(100vh - 96px)",
            minHeight: "400px",
            margin: "0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                Your Bookmarks
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                {total} {total === 1 ? "post" : "posts"} bookmarked
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="rounded-none p-2 sm:p-2.5 min-w-[44px] min-h-[44px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Refresh bookmarks"
              >
                <RefreshCw
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="rounded-none p-2 sm:p-2.5 min-w-[44px] min-h-[44px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Filters - Mobile optimized */}
          {categories.length > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <Select
                    value={selectedCategory || "all"}
                    onValueChange={(value) =>
                      handleCategoryChange(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 md:w-56 rounded-none min-h-[44px] text-sm">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="all" className="rounded-none">
                        All Categories
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="rounded-none"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <span className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                      {selectedCategory}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="text-red-500 mb-4">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-neutral-900 dark:text-white text-center">
                  Failed to load bookmarks
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 text-center mb-4 max-w-sm">
                  There was an error loading your bookmarks. Please try again.
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="rounded-none min-h-[44px] px-4 sm:px-6"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="text-neutral-400 dark:text-neutral-500 mb-4">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-neutral-900 dark:text-white text-center">
                  {selectedCategory
                    ? "No bookmarks in this category"
                    : "No bookmarks yet"}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 text-center mb-4 max-w-sm">
                  {selectedCategory
                    ? `You haven't bookmarked any posts in the "${selectedCategory}" category yet.`
                    : "Start bookmarking posts you want to read later. They'll appear here for easy access."}
                </p>
                {selectedCategory && (
                  <Button
                    onClick={() => handleCategoryChange("")}
                    variant="outline"
                    className="rounded-none min-h-[44px] px-4 sm:px-6"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 sm:p-4 md:p-6">
                {/* Bookmarks List */}
                <motion.div
                  className="space-y-3 sm:space-y-4 md:space-y-6"
                  variants={staggerContainer as Variants}
                  initial="hidden"
                  animate="show"
                >
                  {bookmarks.map((bookmark: UserBookmark, index: number) => (
                    <motion.div key={bookmark.id} variants={fadeUp as Variants}>
                      <CompactBlogCard
                        id={bookmark.blog_post.id}
                        title={bookmark.blog_post.title}
                        excerpt={bookmark.blog_post.excerpt}
                        coverImage={bookmark.blog_post.cover_image ?? undefined}
                        date={bookmark.blog_post.date}
                        category={bookmark.blog_post.category}
                        slug={bookmark.blog_post.slug}
                        index={index}
                        premium={bookmark.blog_post.premium}
                        author={bookmark.blog_post.author}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Pagination - Mobile optimized */}
            {bookmarks.length > 0 && (hasMore || hasPrevious) && (
              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    onClick={handleLoadPrevious}
                    disabled={!hasPrevious || isFetching}
                    variant="outline"
                    size="sm"
                    className="rounded-none min-h-[44px] px-4 sm:px-6 text-sm font-medium"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleLoadMore}
                    disabled={!hasMore || isFetching}
                    variant="outline"
                    size="sm"
                    className="rounded-none min-h-[44px] px-4 sm:px-6 text-sm font-medium"
                  >
                    Next
                  </Button>
                </div>
                <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  {currentOffset + 1} - {Math.min(currentOffset + limit, total)}{" "}
                  of {total}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
