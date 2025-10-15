"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Star, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StaticEngagementMetrics } from "@/components/blog/EngagementMetrics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

interface MediumBlogCardProps {
  id?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  category: string;
  slug: string;
  index?: number;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  author?: string;
  author_details?: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  } | null;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
}

export function MediumBlogCard({
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
  author = "Anonymous",
  author_details = null,
  content_type = "blog",
  recommendation_tags = [],
}: MediumBlogCardProps) {
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

  // Get author display name with proper type checking
  const authorName = String(
    author_details?.display_name || author || "Anonymous",
  );

  // Get author avatar URL
  const getAuthorAvatarUrl = () => {
    if (author_details?.profile_picture_url) {
      return author_details.profile_picture_url;
    }

    // Generate a deterministic avatar based on author name
    // Ensure authorName is a string before calling toLowerCase
    const safeAuthorName =
      typeof authorName === "string" ? authorName : "Anonymous";
    const seed = safeAuthorName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6ccfe,c9b6fb,f5c6ff&backgroundType=gradientLinear`;
  };

  // Get author initials for fallback
  const getAuthorInitials = () => {
    const safeAuthorName =
      typeof authorName === "string" ? authorName : "Anonymous";
    return safeAuthorName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link href={`/blog/${slug}`} className="block group MediumBlogCard">
      <article className="flex flex-row gap-3 sm:gap-4 py-4 sm:py-6 px-0 transition-all duration-200 border-b border-border last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-950">
        {/* Left: Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1.5 sm:space-y-2">
            {/* Category info */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-ui">
              <span className="px-3 py-1.5 text-xs font-medium border border-border text-neutral-800 dark:text-neutral-200 font-ui">
                {category}
              </span>
              {content_type === "research_paper" && (
                <span className="px-3 py-1.5 text-xs font-medium border border-border text-neutral-800 dark:text-neutral-200 font-ui">
                  RESEARCH
                </span>
              )}
              <span>·</span>
              <span>{formattedDate}</span>
              {premium && (
                <>
                  <span>·</span>
                  <Badge
                    variant="default"
                    className="font-medium text-xs px-2 py-0.5 flex items-center gap-1 font-ui"
                  >
                    <Star className="w-3 h-3" />
                    Premium
                  </Badge>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg md:text-xl font-heading group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 line-clamp-2 text-neutral-900 dark:text-white leading-tight">
              {title}
            </h2>

            {/* Excerpt */}
            <p className="line-clamp-2 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-400 mt-1.5 sm:mt-2 font-ui">
              {excerpt}
            </p>

            {/* Author and Engagement Metrics */}
            <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 flex items-center justify-between">
              {/* Author Info */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-border">
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
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium font-ui">
                  {authorName}
                </span>
              </div>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <StaticEngagementMetrics
                  likesCount={likes_count}
                  commentsCount={comments_count}
                  viewsCount={views_count}
                  className="text-xs gap-1.5 sm:gap-2"
                />
                {/* Share Button */}
                <button
                  onClick={async (e) => {
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
                  <div onClick={(e) => e.stopPropagation()}>
                    <DynamicBookmarkButton
                      postId={id}
                      size="sm"
                      className="ml-0.5"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="w-24 sm:w-32 md:w-1/3 flex-shrink-0">
          <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-102"
              sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1200px) 33vw, 25vw"
              priority={index < 3}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
