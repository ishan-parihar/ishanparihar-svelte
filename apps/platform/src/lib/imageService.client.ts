"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

// =============================================================================
// IMAGE TRANSFORMATION PRESETS
// =============================================================================

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "origin" | "webp";
  resize?: "cover" | "contain" | "fill";
}

// Predefined image transformation presets for consistent sizing across the app
export const IMAGE_PRESETS = {
  // Blog-related presets
  BLOG_CARD_SMALL: {
    width: 400,
    height: 300,
    quality: 80,
    format: "webp" as const,
    resize: "cover" as const,
  },
  BLOG_CARD_MEDIUM: {
    width: 600,
    height: 400,
    quality: 85,
    format: "webp" as const,
    resize: "cover" as const,
  },
  BLOG_HERO: {
    width: 1200,
    height: 600,
    quality: 90,
    format: "webp" as const,
    resize: "cover" as const,
  },
  // New compact hero preset for better UX on 16:9 screens (3:1 ratio)
  BLOG_HERO_COMPACT: {
    width: 1200,
    height: 400,
    quality: 90,
    format: "webp" as const,
    resize: "cover" as const,
  },

  // Avatar presets
  AVATAR_SMALL: {
    width: 32,
    height: 32,
    quality: 80,
    format: "webp" as const,
    resize: "cover" as const,
  },
  AVATAR_MEDIUM: {
    width: 64,
    height: 64,
    quality: 85,
    format: "webp" as const,
    resize: "cover" as const,
  },
  AVATAR_LARGE: {
    width: 128,
    height: 128,
    quality: 85,
    format: "webp" as const,
    resize: "cover" as const,
  },
  AVATAR_XL: {
    width: 256,
    height: 256,
    quality: 90,
    format: "webp" as const,
    resize: "cover" as const,
  },

  // Admin thumbnails
  ADMIN_THUMBNAIL: {
    width: 150,
    height: 150,
    quality: 75,
    format: "webp" as const,
    resize: "cover" as const,
  },
} as const;

// =============================================================================
// CORE IMAGE URL FUNCTIONS
// =============================================================================

/**
 * Get the public URL for an image stored in Supabase Storage
 *
 * @param supabaseClient The Supabase client instance
 * @param bucketName The name of the storage bucket
 * @param imagePath The path to the image as stored in the database (can be relative path or full URL)
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getImagePublicUrl(
  supabaseClient: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "") {
    return null;
  }

  try {
    const trimmedPath = imagePath.trim();

    // Check if the imagePath is already a full URL (starts with http:// or https://)
    if (
      trimmedPath.startsWith("http://") ||
      trimmedPath.startsWith("https://")
    ) {
      // If it's already a full URL, return it as-is
      return trimmedPath;
    }

    // Handle relative paths (original logic)
    // Clean the path - remove leading slashes and normalize
    const cleanPath = trimmedPath.replace(/^\/+/, "").trim();

    if (!cleanPath) {
      return null;
    }

    // Get the public URL from Supabase
    const { data } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(cleanPath);

    if (!data?.publicUrl) {
      console.warn(
        `[Image] Failed to generate public URL for ${bucketName}/${cleanPath}`,
      );
      return null;
    }

    return data.publicUrl;
  } catch (error) {
    console.error(
      `[Image] Error generating public URL for ${bucketName}/${imagePath}:`,
      error,
    );
    return null;
  }
}

/**
 * Get an optimized image URL with transformation parameters
 * Uses Supabase's built-in image transformation features for optimized delivery
 *
 * @param supabaseClient The Supabase client instance
 * @param bucketName The name of the storage bucket
 * @param imagePath The path to the image as stored in the database (can be relative path or full URL)
 * @param transformOptions The transformation options to apply
 * @returns The public URL for the transformed image, or null if the path is invalid
 */
export function getOptimizedImageUrl(
  supabaseClient: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
  transformOptions: ImageTransformOptions,
): string | null {
  if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "") {
    return null;
  }

  try {
    const trimmedPath = imagePath.trim();

    // Check if the imagePath is already a full URL (starts with http:// or https://)
    if (
      trimmedPath.startsWith("http://") ||
      trimmedPath.startsWith("https://")
    ) {
      // For full URLs, we need to handle them differently
      // Check if it's already a Supabase storage URL
      const supabaseStoragePattern =
        /^https:\/\/[^.]+\.supabase\.co\/storage\/v1\//;

      if (supabaseStoragePattern.test(trimmedPath)) {
        // It's already a Supabase storage URL
        // We need to convert it to use the render/image endpoint for transformations

        // Extract the object path from the existing URL
        const objectUrlPattern =
          /^https:\/\/([^.]+\.supabase\.co)\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/;
        const renderUrlPattern =
          /^https:\/\/([^.]+\.supabase\.co)\/storage\/v1\/render\/image\/public\/([^\/]+)\/(.+)$/;

        let baseUrl: string;
        let bucket: string;
        let objectPath: string;

        const objectMatch = trimmedPath.match(objectUrlPattern);
        const renderMatch = trimmedPath.match(renderUrlPattern);

        if (objectMatch) {
          // Convert object URL to render URL
          [, baseUrl, bucket, objectPath] = objectMatch;
        } else if (renderMatch) {
          // Already a render URL, extract components
          [, baseUrl, bucket, objectPath] = renderMatch;
          // Remove any existing query parameters
          objectPath = objectPath.split("?")[0];
        } else {
          console.warn(
            `[Image] Unrecognized Supabase URL format: ${trimmedPath}`,
          );
          return trimmedPath; // Return as-is if we can't parse it
        }

        // Build the transform object for Supabase
        const transform: Record<string, any> = {};

        if (transformOptions.width) {
          transform.width = transformOptions.width;
        }

        if (transformOptions.height) {
          transform.height = transformOptions.height;
        }

        if (transformOptions.quality) {
          transform.quality = transformOptions.quality;
        }

        if (transformOptions.format && transformOptions.format !== "origin") {
          transform.format = transformOptions.format;
        }

        if (transformOptions.resize) {
          transform.resize = transformOptions.resize;
        }

        // Build the render URL with transformations
        if (Object.keys(transform).length > 0) {
          const transformParams = new URLSearchParams();
          Object.entries(transform).forEach(([key, value]) => {
            transformParams.append(key, String(value));
          });

          const optimizedUrl = `https://${baseUrl}/storage/v1/render/image/public/${bucket}/${objectPath}?${transformParams.toString()}`;

          // Log the transformation for debugging in development
          if (process.env.NODE_ENV === "development") {
            console.log(`[Image] Converted full URL to optimized render URL:`, {
              originalUrl: trimmedPath,
              bucket,
              objectPath,
              transforms: transform,
              optimizedUrl,
            });
          }

          return optimizedUrl;
        } else {
          // No transformations needed, return the original object URL
          return `https://${baseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
        }
      } else {
        // It's a full URL but not a Supabase storage URL
        // We can't apply Supabase transformations to external URLs
        console.warn(
          `[Image] Cannot apply Supabase transformations to external URL: ${trimmedPath}`,
        );
        return trimmedPath;
      }
    }

    // Handle relative paths (original logic)
    // Clean the path - remove leading slashes and normalize
    const cleanPath = trimmedPath.replace(/^\/+/, "").trim();

    if (!cleanPath) {
      return null;
    }

    // Build the transform object for Supabase
    const transform: Record<string, any> = {};

    if (transformOptions.width) {
      transform.width = transformOptions.width;
    }

    if (transformOptions.height) {
      transform.height = transformOptions.height;
    }

    if (transformOptions.quality) {
      transform.quality = transformOptions.quality;
    }

    if (transformOptions.format && transformOptions.format !== "origin") {
      transform.format = transformOptions.format;
    }

    if (transformOptions.resize) {
      transform.resize = transformOptions.resize;
    }

    // Get the public URL with transformations from Supabase
    const { data } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(cleanPath, {
        transform: Object.keys(transform).length > 0 ? transform : undefined,
      });

    if (!data?.publicUrl) {
      console.warn(
        `[Image] Failed to generate optimized URL for ${bucketName}/${cleanPath}`,
      );
      return null;
    }

    // Log the transformation for debugging in development
    if (
      process.env.NODE_ENV === "development" &&
      Object.keys(transform).length > 0
    ) {
      console.log(`[Image] Generated optimized URL with transforms:`, {
        path: cleanPath,
        bucket: bucketName,
        transforms: transform,
        url: data.publicUrl,
      });
    }

    return data.publicUrl;
  } catch (error) {
    console.error(
      `[Image] Error generating optimized URL for ${bucketName}/${imagePath}:`,
      error,
    );
    return null;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS FOR SPECIFIC USE CASES
// =============================================================================

/**
 * Get a blog cover image URL with preset transformations
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @param size The size preset to use ('small', 'medium', 'hero', 'hero-compact')
 * @returns The optimized public URL for the image, or null if the path is invalid
 */
export function getOptimizedBlogCoverImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
  size: "small" | "medium" | "hero" | "hero-compact" = "medium",
): string | null {
  const presets = {
    small: IMAGE_PRESETS.BLOG_CARD_SMALL,
    medium: IMAGE_PRESETS.BLOG_CARD_MEDIUM,
    hero: IMAGE_PRESETS.BLOG_HERO,
    "hero-compact": IMAGE_PRESETS.BLOG_HERO_COMPACT,
  };

  return getOptimizedImageUrl(
    supabaseClient,
    "blog-images",
    imagePath,
    presets[size],
  );
}

/**
 * Get a profile image URL with preset transformations
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @param size The size preset to use ('small', 'medium', 'large', 'xl')
 * @returns The optimized public URL for the image, or null if the path is invalid
 */
export function getOptimizedProfileImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
  size: "small" | "medium" | "large" | "xl" = "medium",
): string | null {
  const presets = {
    small: IMAGE_PRESETS.AVATAR_SMALL,
    medium: IMAGE_PRESETS.AVATAR_MEDIUM,
    large: IMAGE_PRESETS.AVATAR_LARGE,
    xl: IMAGE_PRESETS.AVATAR_XL,
  };

  return getOptimizedImageUrl(
    supabaseClient,
    "user-uploads",
    imagePath,
    presets[size],
  );
}

/**
 * Get an admin thumbnail URL with preset transformations
 *
 * @param supabaseClient The Supabase client instance
 * @param bucketName The name of the storage bucket
 * @param imagePath The path to the image as stored in the database
 * @returns The optimized public URL for the image, or null if the path is invalid
 */
export function getOptimizedAdminThumbnailUrl(
  supabaseClient: SupabaseClient<Database>,
  bucketName: string,
  imagePath: string | null | undefined,
): string | null {
  return getOptimizedImageUrl(
    supabaseClient,
    bucketName,
    imagePath,
    IMAGE_PRESETS.ADMIN_THUMBNAIL,
  );
}

/**
 * Get a basic blog image URL (for backward compatibility)
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getBlogImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
): string | null {
  return getImagePublicUrl(supabaseClient, "blog-images", imagePath);
}

/**
 * Get an article image URL (for backward compatibility)
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getArticleImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
): string | null {
  return getImagePublicUrl(supabaseClient, "article-images", imagePath);
}
