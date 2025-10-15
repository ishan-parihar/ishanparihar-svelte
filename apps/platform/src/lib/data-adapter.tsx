/**
 * Data Adapter for MagicBento Component
 *
 * This module provides standardized interfaces and transformation functions
 * to adapt different data structures (blog posts, offerings) to work with
 * the MagicBento component's expected format.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { StaticEngagementMetrics } from "@/components/blog/EngagementMetrics";
import { Share2, Eye, MessageSquare, Users, Heart } from "lucide-react";
import { toast } from "sonner";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

/**
 * Static engagement metrics component for offerings
 * Displays views, inquiries, and bookings counts
 */
interface StaticOfferingEngagementMetricsProps {
  viewsCount: number;
  inquiriesCount: number;
  bookingsCount: number;
  className?: string;
}

function StaticOfferingEngagementMetrics({
  viewsCount,
  inquiriesCount,
  bookingsCount,
  className = "",
}: StaticOfferingEngagementMetricsProps) {
  // Extract gap class from className if provided, default to gap-4
  const gapClass = className.includes("gap-")
    ? className.split(" ").find((cls) => cls.startsWith("gap-")) || "gap-4"
    : "gap-4";

  // Remove gap class from other classes to avoid duplication
  const otherClasses = className.replace(/gap-\w+/g, "").trim();

  return (
    <div
      className={`flex items-center ${gapClass} text-sm text-muted-foreground ${otherClasses}`}
    >
      {/* Views Display */}
      <div className="flex items-center gap-1">
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{viewsCount}</span>
      </div>

      {/* Inquiries Display */}
      <div className="flex items-center gap-1">
        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{inquiriesCount}</span>
      </div>

      {/* Bookings Display */}
      <div className="flex items-center gap-1">
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium">{bookingsCount}</span>
      </div>
    </div>
  );
}

// ============================================================================
// STANDARDIZED INTERFACE FOR MAGICBENTO
// ============================================================================

/**
 * Standardized card data interface that MagicBento expects
 * This interface unifies different data types (posts, offerings) into a single format
 */
export interface StandardizedCardData {
  /** Unique identifier for the card */
  id: string;
  /** Card title/heading */
  title: string;
  /** Card description/excerpt */
  description: string;
  /** Navigation URL for the card */
  href: string;
  /** Background image URL (optional) */
  background?: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** React content to render inside the card */
  content: React.ReactNode;
  /** Category/type for filtering and styling */
  category?: string;
  /** Whether this item is featured */
  featured?: boolean;
  /** Publication/creation date */
  date?: string;
  /** Author information */
  author?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// ============================================================================
// SOURCE DATA TYPE DEFINITIONS
// ============================================================================

/**
 * Blog Post interface (from tRPC/Supabase)
 */
export interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  cover_image_url_processed?: string;
  date: string;
  author?: string;
  author_user_id?: string;
  category: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  draft?: boolean;
  premium?: boolean;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  author_details?: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  } | null;
}

/**
 * Offering/Service interface (from tRPC/Supabase)
 */
export interface Offering {
  id: string;
  name?: string;
  title?: string; // Some services might use 'title' instead of 'name'
  slug: string;
  description: string;
  short_description?: string;
  excerpt?: string; // Some might use 'excerpt' instead of 'description'
  cover_image?: string;
  image_url?: string;
  category_id?: string;
  category?: string;
  service_type?: "product" | "service" | "course" | "consultation";
  base_price?: number;
  price?: number;
  currency?: string;
  pricing_type?: "one_time" | "recurring" | "custom";
  available?: boolean;
  featured?: boolean;
  premium?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  author_user_id?: string;
  views_count?: number;
  inquiries_count?: number;
  bookings_count?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Share handler function for blog posts
 * Uses Web Share API if available, falls back to clipboard copy
 */
const handleShare = async (post: Post, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const shareData = {
    title: post.title,
    text: post.excerpt,
    url: `${window.location.origin}/blog/${post.slug}`,
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
      console.error("Failed to share or copy link:", clipboardError);
      toast.error("Failed to share post. Please try again.");
    }
  }
};

/**
 * Share handler function for offerings
 * Uses Web Share API if available, falls back to clipboard copy
 */
const handleOfferingShare = async (offering: Offering, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const shareData = {
    title: offering.title || offering.name || "Service Offering",
    text:
      offering.excerpt || offering.short_description || offering.description,
    url: `${window.location.origin}/offerings/${offering.slug}`,
  };

  try {
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      await navigator.share(shareData);
      toast.success("Offering shared successfully!");
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
      console.error("Failed to share or copy link:", clipboardError);
      toast.error("Failed to share offering. Please try again.");
    }
  }
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms a blog post object to standardized card data
 * @param post - Blog post object from tRPC API
 * @returns StandardizedCardData object for MagicBento
 */
export function transformPostToCardData(post: Post): StandardizedCardData {
  const displayTitle = post.title;
  const displayDescription = post.excerpt;

  // Safely handle image URL with validation
  let displayImage = post.cover_image_url_processed || post.cover_image;

  // Validate and sanitize the image URL
  if (displayImage) {
    try {
      // Check if it's a valid URL format
      if (displayImage.startsWith("http")) {
        new URL(displayImage); // This will throw if invalid
      } else if (!displayImage.startsWith("/")) {
        // If it's not a valid URL or relative path, use default
        displayImage = "/default-blog-image.jpg";
      }
    } catch (error) {
      console.warn(
        `Invalid image URL detected for post "${post.title}": "${displayImage}". Using default image.`,
      );
      displayImage = "/default-blog-image.jpg";
    }
  } else {
    displayImage = "/default-blog-image.jpg";
  }

  const displayAuthor =
    post.author_details?.display_name || post.author || "Anonymous";
  const displayDate = post.date || post.created_at;

  return {
    id: post.id || post.slug,
    title: displayTitle,
    description: displayDescription,
    href: `/blog/${post.slug}`,
    background: displayImage,
    category: post.category,
    featured: post.featured,
    date: displayDate,
    author: displayAuthor,
    className: `blog-card ${post.featured ? "featured" : ""} ${post.premium ? "premium" : ""}`,
    metadata: {
      contentType: post.content_type || "blog",
      premium: post.premium,
      draft: post.draft,
      tags: post.recommendation_tags,
      engagement: {
        likes: post.likes_count,
        comments: post.comments_count,
        views: post.views_count,
      },
    },
    content: (
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="group flex flex-col h-full cursor-pointer transition-all duration-300">
          {/* Header/Image Area with Premium/Research Badges */}
          {displayImage && (
            <div className="relative w-full aspect-video mb-3 rounded-none overflow-hidden">
              {/* Background overlay that darkens on hover */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all duration-300 z-10" />
              <Image
                src={displayImage}
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Premium/Research Indicator Badges */}
              <div className="absolute top-2 right-2 flex gap-1 z-20">
                {post.premium && (
                  <Badge variant="default" className="text-xs">
                    Premium
                  </Badge>
                )}
                {post.content_type === "research_paper" && (
                  <Badge variant="secondary" className="text-xs">
                    Research
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Body Area */}
          <div className="flex-1 space-y-2">
            {/* Category/Tag Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-accent-consciousness/20 text-accent-consciousness border-accent-consciousness/30"
              >
                {post.category}
              </Badge>
            </div>

            {/* Title and Excerpt with responsive text sizing and clamping */}
            <h3 className="text-base md:text-lg font-semibold line-clamp-2 text-white group-hover:text-accent-consciousness transition-colors duration-300">
              {displayTitle}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {displayDescription}
            </p>
          </div>

          {/* Footer Area */}
          <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2">
            {/* Publication Date Row */}
            <div className="flex justify-start">
              <span className="text-xs text-gray-500">
                {displayDate
                  ? formatDistanceToNow(new Date(displayDate), {
                      addSuffix: true,
                    })
                  : "Unknown date"}
              </span>
            </div>

            {/* Engagement Metrics and Action Buttons Row */}
            <div className="flex items-center justify-between">
              {/* Left side: Engagement Metrics */}
              <StaticEngagementMetrics
                likesCount={post.likes_count || 0}
                commentsCount={post.comments_count || 0}
                viewsCount={post.views_count || 0}
                className="gap-4 text-xs"
              />

              {/* Right side: Action Buttons */}
              <div className="flex items-center gap-4">
                {/* Bookmark Button */}
                {post.id && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <DynamicBookmarkButton
                      postId={post.id}
                      postTitle={post.title}
                      size="sm"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Share Button - Symbol Only */}
                <button
                  onClick={(e) => handleShare(post, e)}
                  className="flex items-center text-xs text-gray-400 hover:text-accent-consciousness transition-colors duration-200 p-1 rounded-none hover:bg-gray-700/30"
                  title="Share this post"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    ),
  };
}

/**
 * Transforms an offering/service object to standardized card data
 * @param offering - Offering object from tRPC API
 * @returns StandardizedCardData object for MagicBento
 */
export function transformOfferingToCardData(
  offering: Offering,
): StandardizedCardData {
  const displayTitle = offering.title || offering.name || "Untitled Service";
  const displayDescription =
    offering.excerpt || offering.short_description || offering.description;

  // Safely handle image URL with validation
  let displayImage = offering.cover_image || offering.image_url;

  // Validate and sanitize the image URL
  if (displayImage) {
    try {
      // Check if it's a valid URL format
      if (displayImage.startsWith("http")) {
        new URL(displayImage); // This will throw if invalid
      } else if (!displayImage.startsWith("/")) {
        // If it's not a valid URL or relative path, use default
        displayImage = "/default-service-image.jpg";
      }
    } catch (error) {
      console.warn(
        `Invalid image URL detected for offering "${displayTitle}": "${displayImage}". Using default image.`,
      );
      displayImage = "/default-service-image.jpg";
    }
  } else {
    displayImage = "/default-service-image.jpg";
  }

  const displayPrice = offering.base_price || offering.price;
  const displayCurrency = offering.currency || "USD";

  return {
    id: offering.id,
    title: displayTitle,
    description: displayDescription,
    href: `/offerings/${offering.slug}`,
    background: displayImage,
    category: offering.category || offering.service_type,
    featured: offering.featured,
    date: offering.published_at || offering.created_at,
    className: `offering-card ${offering.featured ? "featured" : ""} ${offering.premium ? "premium" : ""}`,
    metadata: {
      serviceType: offering.service_type,
      price: displayPrice,
      currency: displayCurrency,
      pricingType: offering.pricing_type,
      available: offering.available,
      premium: offering.premium,
      engagement: {
        views: offering.views_count,
        inquiries: offering.inquiries_count,
        bookings: offering.bookings_count,
      },
    },
    content: (
      <Link href={`/offerings/${offering.slug}`} className="block h-full">
        <div className="group flex flex-col h-full cursor-pointer transition-all duration-300">
          {/* Header/Image Area with Premium Badge */}
          {displayImage && (
            <div className="relative w-full aspect-video mb-3 rounded-none overflow-hidden">
              {/* Background overlay that darkens on hover */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all duration-300 z-10" />
              <Image
                src={displayImage}
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Premium Badge */}
              <div className="absolute top-2 right-2 flex gap-1 z-20">
                {offering.premium && (
                  <Badge variant="default" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 space-y-2">
            {/* Service Type Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-accent-consciousness/20 text-accent-consciousness border-accent-consciousness/30 text-xs"
              >
                {offering.service_type || "Service"}
              </Badge>
              {offering.featured && (
                <Badge
                  variant="default"
                  className="text-xs bg-accent-quantum/20 text-accent-quantum border-accent-quantum/30"
                >
                  Featured
                </Badge>
              )}
            </div>

            {/* Title and Description */}
            <h3 className="text-base md:text-lg font-semibold line-clamp-2 text-white group-hover:text-accent-quantum transition-colors duration-300">
              {displayTitle}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {displayDescription}
            </p>
          </div>

          {/* Footer Area */}
          <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2">
            {/* Publication Date Row */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {offering.published_at || offering.created_at
                  ? formatDistanceToNow(
                      new Date(
                        offering.published_at ||
                          offering.created_at ||
                          new Date(),
                      ),
                      { addSuffix: true },
                    )
                  : "Recently added"}
              </span>
              {displayPrice && (
                <span className="text-accent-quantum font-semibold text-sm">
                  {displayCurrency} {displayPrice}
                </span>
              )}
            </div>

            {/* Engagement Metrics and Action Buttons Row */}
            <div className="flex items-center justify-between">
              {/* Left side: Engagement Metrics */}
              <StaticOfferingEngagementMetrics
                viewsCount={offering.views_count || 0}
                inquiriesCount={offering.inquiries_count || 0}
                bookingsCount={offering.bookings_count || 0}
                className="gap-4 text-xs"
              />

              {/* Right side: Share Button */}
              <div className="flex items-center gap-4">
                {/* Share Button - Symbol Only */}
                <button
                  onClick={(e) => handleOfferingShare(offering, e)}
                  className="flex items-center text-xs text-gray-400 hover:text-accent-quantum transition-colors duration-200 p-1 rounded-none hover:bg-gray-700/30"
                  title="Share this offering"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    ),
  };
}

// ============================================================================
// BATCH TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transforms an array of blog posts to standardized card data
 * @param posts - Array of blog post objects
 * @returns Array of StandardizedCardData objects
 */
export function transformPostsToCardData(
  posts: Post[],
): StandardizedCardData[] {
  return posts.map(transformPostToCardData);
}

/**
 * Transforms a bookmark object to MediumBlogCard props
 * @param bookmark - Bookmark object from tRPC API with nested blog_post
 * @returns Props object for MediumBlogCard component
 */
export function transformBookmarkToCardData(bookmark: any) {
  const post = bookmark.blog_post;

  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.cover_image,
    date: post.date,
    category: post.category,
    slug: post.slug,
    premium: post.premium || false,
    likes_count: 0, // Not available in bookmark data
    comments_count: 0, // Not available in bookmark data
    views_count: 0, // Not available in bookmark data
    author: post.author || "Anonymous",
    author_details: null, // Not available in bookmark data
    content_type: "blog" as const,
    recommendation_tags: [],
  };
}

/**
 * Transforms an array of bookmarks to MediumBlogCard props
 * @param bookmarks - Array of bookmark objects
 * @returns Array of props objects for MediumBlogCard components
 */
export function transformBookmarksToCardData(bookmarks: any[]) {
  return bookmarks.map(transformBookmarkToCardData);
}

/**
 * Transforms a featured article object to standardized card data
 * @param article - Featured article object
 * @returns StandardizedCardData object for MagicBento
 */
export function transformFeaturedArticleToCardData(
  article: any,
): StandardizedCardData {
  const displayTitle = article.title;
  const displayDescription = article.excerpt;

  // Safely handle image URL with validation
  let displayImage = article.coverImage || article.cover_image;

  // Validate and sanitize the image URL
  if (displayImage) {
    try {
      // Check if it's a valid URL format
      if (displayImage.startsWith("http")) {
        new URL(displayImage); // This will throw if invalid
      } else if (!displayImage.startsWith("/")) {
        // If it's not a valid URL or relative path, use default
        displayImage = "/default-blog-image.jpg";
      }
    } catch (error) {
      console.warn(
        `Invalid image URL detected for featured article "${displayTitle}": "${displayImage}". Using default image.`,
      );
      displayImage = "/default-blog-image.jpg";
    }
  } else {
    displayImage = "/default-blog-image.jpg";
  }

  const displayDate = article.date;

  return {
    id: article.id || article.slug,
    title: displayTitle,
    description: displayDescription,
    href: `/blog/${article.slug}`,
    background: displayImage,
    category: article.category,
    featured: article.featured || true, // Default to true for featured articles
    date: displayDate,
    author: "Ishan Parihar",
    className: `blog-card featured`,
    metadata: {
      contentType: article.content_type || "blog",
      premium: false,
      draft: false,
      tags: article.recommendation_tags,
      engagement: {
        likes: article.likes_count,
        comments: article.comments_count,
        views: article.views_count,
      },
    },
    content: (
      <Link href={`/blog/${article.slug}`} className="block h-full">
        <div className="group flex flex-col h-full cursor-pointer transition-all duration-300">
          {/* Header/Image Area */}
          {displayImage && (
            <div className="relative w-full aspect-video mb-3 rounded-none overflow-hidden">
              {/* Background overlay that darkens on hover */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all duration-300 z-10" />
              <Image
                src={displayImage}
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-between p-4">
            {/* Category Badge */}
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {article.category}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
              {displayDescription}
            </p>

            {/* Footer with Date and Engagement */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {displayDate ? new Date(displayDate).toLocaleDateString() : ""}
              </span>
              <div className="flex items-center gap-3">
                {article.likes_count && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {article.likes_count}
                  </span>
                )}
                {article.views_count && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    ),
  };
}

/**
 * Transforms an array of featured articles to standardized card data
 * @param articles - Array of featured article objects
 * @returns Array of StandardizedCardData objects
 */
export function transformFeaturedArticlesToCardData(
  articles: any[],
): StandardizedCardData[] {
  return articles.map(transformFeaturedArticleToCardData);
}

/**
 * Transforms a ProductService object to standardized card data
 * @param service - ProductService object from Supabase
 * @returns StandardizedCardData object for MagicBento
 */
export function transformProductServiceToCardData(
  service: any,
): StandardizedCardData {
  const displayTitle = service.title || service.name;
  const displayDescription =
    service.excerpt || service.short_description || service.description;

  // Safely handle image URL with validation
  let displayImage = service.cover_image || service.image_url;

  // Validate and sanitize the image URL
  if (displayImage) {
    try {
      // Check if it's a valid URL format
      if (displayImage.startsWith("http")) {
        new URL(displayImage); // This will throw if invalid
      } else if (!displayImage.startsWith("/")) {
        // If it's not a valid URL or relative path, use default
        displayImage = "/default-service-image.jpg";
      }
    } catch (error) {
      console.warn(
        `Invalid image URL detected for service "${displayTitle}": "${displayImage}". Using default image.`,
      );
      displayImage = "/default-service-image.jpg";
    }
  } else {
    displayImage = "/default-service-image.jpg";
  }

  const displayPrice = service.base_price || service.price;
  const displayCategory = service.category?.name || service.category;

  return {
    id: service.id,
    title: displayTitle,
    description: displayDescription,
    href: `/offerings/${service.slug}`,
    background: displayImage,
    category: displayCategory,
    featured: service.featured || false,
    date: service.published_at || service.created_at,
    author: "Ishan Parihar",
    className: `service-card ${service.featured ? "featured" : ""} ${service.premium ? "premium" : ""}`,
    metadata: {
      contentType: "service",
      premium: service.premium,
      serviceType: service.service_type,
      price: displayPrice,
      currency: service.currency || "USD",
      pricingType: service.pricing_type,
      available: service.available,
      engagement: {
        views: service.views_count,
        inquiries: service.inquiries_count,
        bookings: service.bookings_count,
      },
    },
    content: (
      <div className="group flex flex-col h-full cursor-pointer transition-all duration-300">
        {/* Most Popular Badge */}
        {service.featured && (
          <div className="bg-gradient-to-r from-accent-consciousness to-accent-quantum text-white text-xs font-semibold px-3 py-1 text-center">
            MOST POPULAR
          </div>
        )}

        <div className="p-6 flex flex-col h-full">
          {/* Tier Name */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {displayTitle}
            </h3>
            {/* Target Audience Descriptor */}
            <p className="text-sm text-muted-foreground">
              {displayCategory
                ? `For ${displayCategory.toLowerCase()}`
                : "For conscious growth seekers"}
            </p>
          </div>

          {/* Prominent Price Display */}
          <div className="text-center mb-6">
            {displayPrice ? (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {service.currency || "$"}
                  {displayPrice}
                </span>
                {service.pricing_type === "recurring" && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                Custom Pricing
              </div>
            )}
          </div>

          {/* Feature List with Checkmarks */}
          <div className="flex-1 mb-6">
            <ul className="space-y-3">
              {/* Parse description into features or use default features */}
              {displayDescription
                .split(".")
                .filter((feature: string) => feature.trim())
                .slice(0, 4)
                .map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-foreground">
                      {feature.trim()}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Action-Oriented CTA Button */}
          <Link href={`/offerings/${service.slug}`} className="block">
            <button
              className={`w-full py-3 px-4 rounded font-semibold text-sm transition-all duration-300 ${
                service.featured
                  ? "bg-gradient-to-r from-accent-consciousness to-accent-quantum text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {service.service_type === "consultation"
                ? "Book Consultation"
                : service.service_type === "course"
                  ? "Enroll Now"
                  : "Get Started"}
            </button>
          </Link>

          {/* Risk Reduction Element */}
          <p className="text-xs text-center text-muted-foreground mt-3">
            30-day satisfaction guarantee
          </p>
        </div>
      </div>
    ),
  };
}

/**
 * Transforms an array of ProductService objects to standardized card data
 * @param services - Array of ProductService objects
 * @returns Array of StandardizedCardData objects
 */
export function transformProductServicesToCardData(
  services: any[],
): StandardizedCardData[] {
  return services.map(transformProductServiceToCardData);
}

/**
 * Transforms an array of offerings to standardized card data
 * @param offerings - Array of offering objects
 * @returns Array of StandardizedCardData objects
 */
export function transformOfferingsToCardData(
  offerings: Offering[],
): StandardizedCardData[] {
  return offerings.map(transformOfferingToCardData);
}

/**
 * Combines and transforms mixed data types to standardized card data
 * @param data - Object containing posts and/or offerings arrays
 * @returns Combined array of StandardizedCardData objects
 */
export function transformMixedDataToCardData(data: {
  posts?: Post[];
  offerings?: Offering[];
}): StandardizedCardData[] {
  const transformedPosts = data.posts
    ? transformPostsToCardData(data.posts)
    : [];
  const transformedOfferings = data.offerings
    ? transformOfferingsToCardData(data.offerings)
    : [];

  return [...transformedPosts, ...transformedOfferings];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Filters standardized card data by category
 * @param cards - Array of StandardizedCardData
 * @param category - Category to filter by
 * @returns Filtered array of StandardizedCardData
 */
export function filterCardsByCategory(
  cards: StandardizedCardData[],
  category: string,
): StandardizedCardData[] {
  return cards.filter((card) => card.category === category);
}

/**
 * Sorts standardized card data by various criteria
 * @param cards - Array of StandardizedCardData
 * @param sortBy - Sort criteria
 * @param order - Sort order
 * @returns Sorted array of StandardizedCardData
 */
export function sortCards(
  cards: StandardizedCardData[],
  sortBy: "title" | "date" | "featured" = "date",
  order: "asc" | "desc" = "desc",
): StandardizedCardData[] {
  return [...cards].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "date":
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        comparison = dateA - dateB;
        break;
      case "featured":
        comparison = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        break;
    }

    return order === "desc" ? -comparison : comparison;
  });
}
