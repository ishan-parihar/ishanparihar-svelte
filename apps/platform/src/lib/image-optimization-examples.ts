/**
 * Supabase Storage Image Optimization Examples
 *
 * This file demonstrates how to use the new image transformation features
 * for optimized image delivery across different components and use cases.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import {
  getOptimizedImageUrl,
  getOptimizedBlogCoverImageUrl,
  getOptimizedProfileImageUrl,
  getOptimizedAdminThumbnailUrl,
  IMAGE_PRESETS,
  ImageTransformOptions,
} from "./imageService";

// =============================================================================
// BLOG COMPONENT OPTIMIZATION EXAMPLES
// =============================================================================

/**
 * Example: Optimized image URL for MediumBlogCard component
 *
 * BEFORE (unoptimized):
 * const imageSrc = coverImage || "/default-blog-image.jpg";
 *
 * AFTER (optimized):
 */
export function getOptimizedBlogCardImage(
  supabase: SupabaseClient<Database>,
  coverImage: string | null | undefined,
  context: "list" | "grid" | "sidebar" = "list",
): string {
  if (!coverImage) {
    return "/default-blog-image.jpg";
  }

  // Use different optimizations based on display context
  const sizeMap = {
    list: "small" as const, // 400x300 for list view
    grid: "medium" as const, // 600x400 for grid view
    sidebar: "small" as const, // 400x300 for sidebar
  };

  const optimizedUrl = getOptimizedBlogCoverImageUrl(
    supabase,
    coverImage,
    sizeMap[context],
  );

  return optimizedUrl || coverImage || "/default-blog-image.jpg";
}

/**
 * Example: Optimized image URL for blog post hero images
 */
export function getOptimizedBlogHeroImage(
  supabase: SupabaseClient<Database>,
  coverImage: string | null | undefined,
  compact: boolean = true,
): string {
  if (!coverImage) {
    return "/default-blog-image.jpg";
  }

  const optimizedUrl = getOptimizedBlogCoverImageUrl(
    supabase,
    coverImage,
    compact ? "hero-compact" : "hero", // Use compact 3:1 ratio by default for better UX
  );

  return optimizedUrl || coverImage || "/default-blog-image.jpg";
}

// =============================================================================
// AVATAR/PROFILE IMAGE OPTIMIZATION EXAMPLES
// =============================================================================

/**
 * Example: Optimized avatar URLs for different contexts
 */
export function getOptimizedAvatarImage(
  supabase: SupabaseClient<Database>,
  profileImagePath: string | null | undefined,
  context: "comment" | "card" | "profile" | "header" = "card",
): string | null {
  if (!profileImagePath) {
    return null; // Let the component handle fallback generation
  }

  const sizeMap = {
    comment: "small" as const, // 32x32 for comments
    card: "medium" as const, // 48x48 for cards
    profile: "large" as const, // 64x64 for profile views
    header: "xl" as const, // 128x128 for profile headers
  };

  return getOptimizedProfileImageUrl(
    supabase,
    profileImagePath,
    sizeMap[context],
  );
}

// =============================================================================
// ADMIN COMPONENT OPTIMIZATION EXAMPLES
// =============================================================================

/**
 * Example: Optimized thumbnails for admin image gallery
 */
export function getOptimizedAdminGalleryImage(
  supabase: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
): string {
  if (!imagePath) {
    return "/default-blog-image.jpg";
  }

  const optimizedUrl = getOptimizedAdminThumbnailUrl(
    supabase,
    bucketName,
    imagePath,
  );

  return optimizedUrl || "/default-blog-image.jpg";
}

// =============================================================================
// CUSTOM TRANSFORMATION EXAMPLES
// =============================================================================

/**
 * Example: Custom transformations for specific use cases
 */
export function getCustomOptimizedImage(
  supabase: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
  customOptions: ImageTransformOptions,
): string | null {
  return getOptimizedImageUrl(supabase, bucketName, imagePath, customOptions);
}

/**
 * Example: Responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(
  supabase: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
) {
  if (!imagePath) {
    return {
      mobile: "/default-blog-image.jpg",
      tablet: "/default-blog-image.jpg",
      desktop: "/default-blog-image.jpg",
    };
  }

  return {
    // Mobile: smaller, more compressed
    mobile: getOptimizedImageUrl(supabase, bucketName, imagePath, {
      width: 400,
      height: 300,
      resize: "cover",
      format: "webp",
      quality: 75,
    }),
    // Tablet: medium size
    tablet: getOptimizedImageUrl(supabase, bucketName, imagePath, {
      width: 600,
      height: 400,
      resize: "cover",
      format: "webp",
      quality: 80,
    }),
    // Desktop: larger, higher quality
    desktop: getOptimizedImageUrl(supabase, bucketName, imagePath, {
      width: 800,
      height: 600,
      resize: "cover",
      format: "webp",
      quality: 85,
    }),
  };
}

// =============================================================================
// COMPONENT INTEGRATION EXAMPLES
// =============================================================================

/**
 * Example: How to integrate optimized images in a React component
 *
 * ```tsx
 * import { createClient } from "@/utils/supabase/client";
 * import { getOptimizedBlogCardImage } from "@/lib/image-optimization-examples";
 *
 * export function OptimizedBlogCard({ coverImage, title }: BlogCardProps) {
 *   const supabase = createClient();
 *   const optimizedImageSrc = getOptimizedBlogCardImage(supabase, coverImage, 'list');
 *
 *   return (
 *     <div className="blog-card">
 *       <Image
 *         src={optimizedImageSrc}
 *         alt={title}
 *         width={400}
 *         height={300}
 *         className="object-cover"
 *         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Example: Server-side image optimization for prefetching
 *
 * ```tsx
 * // In a Server Component
 * import { createServerClient } from "@/utils/supabase/server";
 * import { getOptimizedBlogHeroImage } from "@/lib/image-optimization-examples";
 *
 * export async function BlogPostHero({ post }: { post: BlogPost }) {
 *   const supabase = createServerClient();
 *   const optimizedHeroImage = getOptimizedBlogHeroImage(supabase, post.cover_image);
 *
 *   return (
 *     <div className="hero-section">
 *       <Image
 *         src={optimizedHeroImage}
 *         alt={post.title}
 *         width={1200}
 *         height={600}
 *         priority
 *         className="object-cover"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

// =============================================================================
// MIGRATION GUIDE
// =============================================================================

/**
 * MIGRATION STEPS:
 *
 * 1. Replace direct getImagePublicUrl calls with optimized versions:
 *    - Blog covers: use getOptimizedBlogCoverImageUrl()
 *    - Avatars: use getOptimizedProfileImageUrl()
 *    - Admin thumbnails: use getOptimizedAdminThumbnailUrl()
 *
 * 2. Update component image handling:
 *    - Import the optimization functions
 *    - Replace imageSrc logic with optimized versions
 *    - Consider display context (list, grid, hero, etc.)
 *
 * 3. Test image loading:
 *    - Verify WebP format support
 *    - Check different screen sizes
 *    - Monitor loading performance
 *
 * 4. Gradual rollout:
 *    - Start with blog cards (most common)
 *    - Move to hero images
 *    - Finally optimize admin components
 */
