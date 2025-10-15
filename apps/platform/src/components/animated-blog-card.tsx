"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2 } from "lucide-react";
import { StaticEngagementMetrics } from "@/components/blog/EngagementMetrics";
import { toast } from "sonner";
import { CoverImage } from "@/components/optimized/OptimizedImage";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

interface AnimatedBlogCardProps {
  id?: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  category: string;
  slug: string;
  index?: number;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
}

export function AnimatedBlogCard({
  id,
  title,
  excerpt,
  coverImage,
  date,
  category,
  slug,
  index = 0,
  premium = false,
  likes_count = 0,
  comments_count = 0,
  views_count = 0,
  content_type = "blog",
  recommendation_tags = [],
}: AnimatedBlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper function to get blog cover image URL with simple URL pattern fixing
  const getBlogImage = (coverImageUrl: string): string => {
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

  const handleShareClick = async (e: React.MouseEvent) => {
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
        toast.error("Failed to share post. Please try again.");
      }
    }
  };

  return (
    <Link href={`/blog/${slug}`} className="block h-full AnimatedBlogCard">
      <div className="group overflow-hidden h-full hover:shadow-sm transition-all duration-300 bg-card border border-border rounded-none">
        {/* Cover Image - Optimized with AVIF/WebP support */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <CoverImage
            src={imageSrc}
            alt={title}
            className="transition-transform duration-300 group-hover:scale-102"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        {/* Content area with borders */}
        <div className="p-4 sm:p-6 border-t-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-3 py-1.5 text-xs font-ui font-medium border border-border text-foreground rounded-none">
                {category}
              </span>
              {content_type === "research_paper" && (
                <span className="px-3 py-1.5 text-xs font-ui font-medium border border-border text-foreground rounded-none">
                  RESEARCH
                </span>
              )}
              {premium && (
                <Badge
                  variant="default"
                  className="font-ui font-medium text-xs flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  Premium
                </Badge>
              )}
              <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                {formattedDate}
              </span>
            </div>
            {/* Bookmark Button */}
            {id && (
              <div onClick={(e) => e.stopPropagation()}>
                <DynamicBookmarkButton postId={id} postTitle={title} size="sm" />
              </div>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 line-clamp-2 text-neutral-900 dark:text-white">
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3 mb-3 sm:mb-4 font-body">
            {excerpt}
          </p>

          {/* Engagement Metrics */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <StaticEngagementMetrics
              likesCount={likes_count}
              commentsCount={comments_count}
              viewsCount={views_count}
              className="text-xs gap-1.5 sm:gap-2"
            />
            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
              title="Share post"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}