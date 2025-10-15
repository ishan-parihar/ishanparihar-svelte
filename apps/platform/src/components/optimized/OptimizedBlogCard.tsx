"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StaticEngagementMetrics } from "@/components/blog/EngagementMetrics";
import { CoverImage } from "@/components/optimized/OptimizedImage";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import { normalizeImageUrl } from "@/lib/imageUtils";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

interface OptimizedBlogCardProps {
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

export function OptimizedBlogCard({
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
}: OptimizedBlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Normalize image URL with fallback
  const imageSrc = normalizeImageUrl(coverImage, {
    fallbackUrl: "/default-blog-image.jpg",
    context: "blog",
  });

  return (
    <Link href={`/blog/${slug}`} className="block h-full OptimizedBlogCard">
      <div className="group overflow-hidden h-full hover:shadow-sm transition-all duration-300 bg-white dark:bg-black">
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
        <div className="p-4 sm:p-6 border border-border border-t-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Badge
                variant="outline"
                className="font-medium text-xs px-2 py-1"
              >
                {category}
              </Badge>
              {content_type === "research_paper" && (
                <Badge
                  variant="outline"
                  className="font-medium text-xs px-2 py-1"
                >
                  RESEARCH
                </Badge>
              )}
              {premium && (
                <Badge
                  variant="default"
                  className="font-medium text-xs px-2 py-1 flex items-center gap-1"
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
          <div className="flex items-center justify-between">
            <StaticEngagementMetrics
              likesCount={likes_count}
              commentsCount={comments_count}
              viewsCount={views_count}
              className="gap-2"
            />

            {/* Recommendation Tags */}
            {recommendation_tags && recommendation_tags.length > 0 && (
              <div className="flex items-center gap-1">
                {recommendation_tags.slice(0, 2).map((tag, tagIndex) => (
                  <Badge
                    key={tagIndex}
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
                {recommendation_tags.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 font-normal"
                  >
                    +{recommendation_tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default OptimizedBlogCard;
