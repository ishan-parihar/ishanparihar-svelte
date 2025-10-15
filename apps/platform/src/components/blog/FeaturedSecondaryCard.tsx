"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Star, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StaticEngagementMetrics } from "@/components/blog/EngagementMetrics";
import { useSocialShare } from "@/hooks/useSocialShare";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

interface FeaturedSecondaryCardProps {
  id?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  category: string;
  slug: string;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
}

export function FeaturedSecondaryCard({
  id,
  title,
  excerpt,
  coverImage,
  date,
  category,
  slug,
  premium = false,
  likes_count = 0,
  comments_count = 0,
  views_count = 0,
  content_type = "blog",
  recommendation_tags = [],
}: FeaturedSecondaryCardProps) {
  // Format date as "X days ago" or similar
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

  // Social sharing functionality
  const { shareOnTwitter, shareOnFacebook, shareOnLinkedIn, copyToClipboard, nativeShare } = useSocialShare({
    title,
    slug,
    text: excerpt,
  });

  // Functional share handler
  const handleShareClick = async (e: React.MouseEvent) => {
    await nativeShare(e);
  };

  return (
    <Link href={`/blog/${slug}`} className="block group FeaturedSecondaryCard">
      <article className="flex flex-col gap-4 sm:gap-5 py-5 px-0 transition-all duration-200 border-b border-border last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/50">
        {/* Top: Cover Image */}
        <div className="w-full flex-shrink-0">
          <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-sm">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
            {/* Premium badge overlay */}
            {premium && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground font-ui"
                >
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Premium
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Content */}
        <div className="flex flex-col justify-between flex-1">
          <div className="space-y-2">
            {/* Category and Content Type */}
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-ui">
              <span className="px-2.5 py-1 text-xs font-medium border border-border text-neutral-800 dark:text-neutral-200 font-ui rounded-none">
                {category}
              </span>
              {content_type === "research_paper" && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 border-primary/20 text-primary bg-primary/5 font-ui"
                >
                  Research
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-headings font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200">
              {title}
            </h3>

            {/* Excerpt */}
            <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 font-body leading-relaxed">
              {excerpt}
            </p>
          </div>

          {/* Bottom Row: Date + Actions */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            {/* Left: Date */}
            <div className="flex items-center">
              <span className="text-xs text-neutral-500 dark:text-neutral-500 font-ui">
                {formattedDate}
              </span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Engagement Metrics */}
              <StaticEngagementMetrics
                likesCount={likes_count}
                commentsCount={comments_count}
                viewsCount={views_count}
                className="text-xs"
              />

              {/* Share Button */}
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200 p-1 rounded-none border border-transparent hover:border-border"
                title="Share post"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Bookmark Button */}
              {id && (
                <div onClick={(e) => e.stopPropagation()}>
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
      </article>
    </Link>
  );
}