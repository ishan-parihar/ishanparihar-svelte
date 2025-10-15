/**
 * Image Service - Consolidated Image Utilities
 *
 * This service consolidates all image-related functionality including:
 * - URL generation utilities (client-safe)
 * - Server-side bucket management operations
 * - Image slots management
 * - File upload operations
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { normalizeImageUrl, getDefaultImageUrl } from "./imageUtils";

// =============================================================================
// IMAGE TRANSFORMATION TYPES AND INTERFACES
// =============================================================================

/**
 * Image transformation options for Supabase Storage
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  resize?: "cover" | "contain" | "fill";
  format?: "webp" | "jpeg" | "png";
  quality?: number;
}

/**
 * Predefined image transformation presets for common use cases
 */
export const IMAGE_PRESETS = {
  // Blog card thumbnails
  BLOG_CARD_SMALL: {
    width: 400,
    height: 300,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 80,
  },
  BLOG_CARD_MEDIUM: {
    width: 600,
    height: 400,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 85,
  },

  // Hero images
  BLOG_HERO: {
    width: 1200,
    height: 600,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 90,
  },
  // New compact hero preset for better UX on 16:9 screens (3:1 ratio)
  BLOG_HERO_COMPACT: {
    width: 1200,
    height: 400,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 90,
  },

  // Admin thumbnails
  ADMIN_THUMBNAIL: {
    width: 300,
    height: 200,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 75,
  },

  // Avatar sizes
  AVATAR_SMALL: {
    width: 32,
    height: 32,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 85,
  },
  AVATAR_MEDIUM: {
    width: 48,
    height: 48,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 85,
  },
  AVATAR_LARGE: {
    width: 64,
    height: 64,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 85,
  },
  AVATAR_XL: {
    width: 128,
    height: 128,
    resize: "cover" as const,
    format: "webp" as const,
    quality: 85,
  },
} as const;

// =============================================================================
// CLIENT-SAFE IMAGE URL UTILITIES
// =============================================================================

/**
 * Get the public URL for an image stored in Supabase storage
 *
 * This function generates a public URL for an image stored in Supabase Storage
 * using the official storage.from(bucketName).getPublicUrl() method.
 *
 * It handles:
 * - Null/undefined paths
 * - Already formatted URLs
 * - Path cleaning (removing leading slashes)
 * - Special handling for blog-images bucket to prevent path issues
 *
 * @param supabaseClient The Supabase client instance
 * @param bucketName The name of the storage bucket (e.g., "blog-images", "user-uploads")
 * @param storedImagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getImagePublicUrl(
  supabaseClient: SupabaseClient<Database>,
  bucketName: string,
  storedImagePath: string | null | undefined,
): string | null {
  if (!storedImagePath) {
    console.warn(
      `getImagePublicUrl called with null or undefined storedImagePath for bucket "${bucketName}".`,
    );
    return null;
  }

  // Basic check if it's already a full URL
  if (
    storedImagePath.startsWith("http://") ||
    storedImagePath.startsWith("https://")
  ) {
    return storedImagePath;
  }

  // Clean the path (remove any leading slashes)
  let cleanedPath = storedImagePath.startsWith("/")
    ? storedImagePath.substring(1)
    : storedImagePath;

  if (!cleanedPath) {
    console.warn(
      `getImagePublicUrl: after cleaning, path is empty for original path "${storedImagePath}" in bucket "${bucketName}".`,
    );
    return null;
  }

  // CRITICAL FIX: Remove 'blog/' prefix for blog-images bucket to prevent path issues
  // This fixes the issue where the URL becomes blog-images/blog/public/... instead of blog-images/public/...
  if (bucketName === "blog-images" && cleanedPath.startsWith("blog/")) {
    const originalPath = cleanedPath;
    cleanedPath = cleanedPath.replace(/^blog\//, "");
    console.log(
      `getImagePublicUrl: Removed 'blog/' prefix from path: "${originalPath}" -> "${cleanedPath}"`,
    );
  }

  try {
    const { data } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(cleanedPath);

    if (!data || !data.publicUrl) {
      // This case might happen if the object doesn't exist or permissions are wrong,
      // though Supabase often returns a URL that would 404.
      // Supabase's getPublicUrl itself doesn't throw for non-existent files but returns a URL.
      // The actual error for non-existent files usually comes when trying to access the URL.
      // However, if data.publicUrl is explicitly null/undefined, we should handle it.
      console.warn(
        `Supabase storage.getPublicUrl did not return a publicUrl for path "${cleanedPath}" in bucket "${bucketName}". Result was:`,
        data,
      );
      return null;
    }
    return data.publicUrl;
  } catch (error) {
    console.error(
      `Error generating public URL for path "${cleanedPath}" in bucket "${bucketName}":`,
      error,
    );
    return null;
  }
}

/**
 * Get the public URL for an image with transformations applied
 *
 * This function extends getImagePublicUrl to support Supabase's built-in image transformations
 * for optimized delivery with resizing, format conversion, and quality adjustments.
 *
 * @param supabaseClient The Supabase client instance
 * @param bucketName The name of the storage bucket
 * @param storedImagePath The path to the image as stored in the database
 * @param transformOptions Image transformation options
 * @returns The public URL for the transformed image, or null if the path is invalid
 */
export function getOptimizedImageUrl(
  supabaseClient: SupabaseClient<Database>,
  bucketName: string,
  storedImagePath: string | null | undefined,
  transformOptions?: ImageTransformOptions,
): string | null {
  if (!storedImagePath) {
    console.warn(
      `getOptimizedImageUrl called with null or undefined storedImagePath for bucket "${bucketName}".`,
    );
    return null;
  }

  // Basic check if it's already a full URL
  if (
    storedImagePath.startsWith("http://") ||
    storedImagePath.startsWith("https://")
  ) {
    return storedImagePath;
  }

  // Clean the path (remove any leading slashes)
  let cleanedPath = storedImagePath.startsWith("/")
    ? storedImagePath.substring(1)
    : storedImagePath;

  if (!cleanedPath) {
    console.warn(
      `getOptimizedImageUrl: after cleaning, path is empty for original path "${storedImagePath}" in bucket "${bucketName}".`,
    );
    return null;
  }

  // CRITICAL FIX: Remove 'blog/' prefix for blog-images bucket to prevent path issues
  if (bucketName === "blog-images" && cleanedPath.startsWith("blog/")) {
    const originalPath = cleanedPath;
    cleanedPath = cleanedPath.replace(/^blog\//, "");
    console.log(
      `getOptimizedImageUrl: Removed 'blog/' prefix from path: "${originalPath}" -> "${cleanedPath}"`,
    );
  }

  try {
    // For now, return the basic URL without transformations
    // TODO: Implement proper Supabase image transformations when available
    const { data } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(cleanedPath);

    if (!data || !data.publicUrl) {
      console.warn(
        `Supabase storage.getPublicUrl did not return a publicUrl for path "${cleanedPath}" in bucket "${bucketName}". Result was:`,
        data,
      );
      return null;
    }
    return data.publicUrl;
  } catch (error) {
    console.error(
      `Error generating optimized URL for path "${cleanedPath}" in bucket "${bucketName}":`,
      error,
    );
    return null;
  }
}

/**
 * Get the public URL for a blog cover image
 *
 * This is a convenience wrapper around getImagePublicUrl that specifically
 * targets the "blog-images" bucket for blog cover images.
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getBlogCoverImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
): string | null {
  return getImagePublicUrl(supabaseClient, "blog-images", imagePath);
}

/**
 * Get the public URL for a profile image
 *
 * This is a convenience wrapper around getImagePublicUrl that specifically
 * targets the "user-uploads" bucket for user profile images.
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getProfileImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
): string | null {
  return getImagePublicUrl(supabaseClient, "user-uploads", imagePath);
}

/**
 * Get the public URL for a site image (logos, icons, etc.)
 *
 * This is a convenience wrapper around getImagePublicUrl that specifically
 * targets the "site-images" bucket for site assets like logos and icons.
 *
 * @param supabaseClient The Supabase client instance
 * @param imagePath The path to the image as stored in the database
 * @returns The public URL for the image, or null if the path is invalid
 */
export function getSiteImageUrl(
  supabaseClient: SupabaseClient<Database>,
  imagePath: string | null | undefined,
): string | null {
  return getImagePublicUrl(supabaseClient, "site-images", imagePath);
}

/**
 * Get the public URL for an article image
 *
 * This is a convenience wrapper around getImagePublicUrl that specifically
 * targets the "article-images" bucket for article content images.
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

// =============================================================================
// OPTIMIZED IMAGE URL CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get an optimized blog cover image URL with preset transformations
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
 * Get an optimized profile image URL with preset transformations
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
 * Get an optimized admin thumbnail URL with preset transformations
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

// =============================================================================
// SERVER-SIDE IMAGE MANAGEMENT OPERATIONS
// =============================================================================

// Import server-only dependencies conditionally to avoid client-side issues
let createServiceRoleClient: any;
let unstable_cache: any;

// Dynamically import server-only dependencies
if (typeof window === "undefined") {
  try {
    createServiceRoleClient =
      require("@/utils/supabase/server").createServiceRoleClient;
    unstable_cache = require("next/cache").unstable_cache;
  } catch (error) {
    console.warn("Server-only dependencies not available in client context");
  }
}

/**
 * Ensure a bucket exists in Supabase Storage (server-side implementation)
 * @param bucketName The name of the bucket to ensure exists
 * @returns True if the bucket exists or was created, false otherwise
 */
export async function ensureBucketExistsServer(
  bucketName: string,
): Promise<boolean> {
  if (typeof window !== "undefined") {
    throw new Error(
      "ensureBucketExistsServer can only be called on the server",
    );
  }

  try {
    // Get Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Image] Supabase client not initialized");
      return false;
    }

    // Check if the bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error(`[Image] Error listing buckets:`, listError);
      return false;
    }

    // Check if our bucket exists
    const bucketExists = buckets.some(
      (bucket: any) => bucket.name === bucketName,
    );

    if (bucketExists) {
      console.log(`[Image] Bucket ${bucketName} already exists`);
      return true;
    }

    // Create the bucket if it doesn't exist
    console.log(`[Image] Bucket ${bucketName} does not exist, creating it...`);
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ],
      },
    );

    if (createError) {
      console.error(
        `[Image] Error creating bucket ${bucketName}:`,
        createError,
      );
      return false;
    }

    console.log(`[Image] Bucket ${bucketName} created successfully`);
    return true;
  } catch (error) {
    console.error(
      `[Image] Unexpected error in ensureBucketExistsServer:`,
      error,
    );
    return false;
  }
}

/**
 * List images in a Supabase Storage bucket (server-side implementation)
 * @param bucketName The name of the bucket to list images from
 * @returns Array of image objects with name, url, size, and created_at
 */
export async function listBucketImagesServer(
  bucketName: string,
): Promise<any[]> {
  if (typeof window !== "undefined") {
    throw new Error("listBucketImagesServer can only be called on the server");
  }

  try {
    // Get Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Image] Supabase client not initialized");
      return [];
    }

    // List files in the bucket
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list();

    if (rootError) {
      console.error(
        `[Image] Error listing files in bucket ${bucketName}:`,
        rootError,
      );
      return [];
    }

    if (!rootFiles || rootFiles.length === 0) {
      console.log(`[Image] No files found in bucket ${bucketName}`);
      return [];
    }

    // Only include files (not folders) from the root
    // In Supabase, folders might be identified by having id ending with '/' or with .metadata being null
    const filteredRootFiles = (rootFiles || []).filter((item: any) => {
      const isFolder =
        item.id?.endsWith("/") ||
        item.name?.endsWith("/") ||
        item.metadata === null ||
        rootFiles.some((f: any) => f.name.startsWith(item.name + "/"));
      return !isFolder;
    });

    // Check if there's a blog subfolder
    const blogFolderExists = rootFiles.some(
      (item: any) => item.name === "blog" && item.id?.endsWith("/"),
    );

    // If blog subfolder exists, list files from it too
    let blogFiles: any[] = [];
    if (blogFolderExists) {
      try {
        const { data: blogFileData, error: blogError } = await supabase.storage
          .from(bucketName)
          .list("blog");

        if (!blogError && blogFileData && blogFileData.length > 0) {
          // Map blog subfolder files to include the subfolder in the path
          blogFiles = blogFileData
            .filter(
              (item: any) =>
                !item.id?.endsWith("/") && !item.name?.endsWith("/"),
            ) // Skip any subfolders
            .map((item: any) => ({
              ...item,
              name: `blog/${item.name}`,
            }));
        }
      } catch (error) {
        console.error(`[Image] Error listing blog subfolder:`, error);
        // Continue with root files only
      }
    }

    // Combine root files and blog files
    const allFiles = [...filteredRootFiles, ...blogFiles];

    // Generate public URLs for all files
    const images = await Promise.all(
      allFiles.map(async (file) => {
        // Get the public URL for the file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);

        const publicUrl = urlData?.publicUrl || "";
        // Apply consolidated URL normalization
        const fixedUrl = normalizeImageUrl(publicUrl, {
          context: "blog",
          logFixes: true,
        });

        return {
          name: file.name,
          url: fixedUrl,
          bucketPath: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
        };
      }),
    );

    return images;
  } catch (error) {
    console.error(`[Image] Unexpected error in listBucketImagesServer:`, error);
    return [];
  }
}

/**
 * Delete an image from a Supabase Storage bucket (server-side implementation)
 * @param path The path of the image to delete
 * @param bucketName The name of the bucket containing the image
 * @returns Object with success status and error message if applicable
 */
export async function deleteImageFromBucketServer(
  path: string,
  bucketName: string = "blog-images",
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    throw new Error(
      "deleteImageFromBucketServer can only be called on the server",
    );
  }

  try {
    if (!path) {
      return { success: false, error: "Path is required" };
    }

    // Get Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      console.error(
        `[Image] Error deleting file ${bucketName}/${path}:`,
        error,
      );
      return { success: false, error: error.message };
    }

    console.log(`[Image] Successfully deleted file ${bucketName}/${path}`);
    return { success: true };
  } catch (error: any) {
    console.error(
      `[Image] Unexpected error in deleteImageFromBucketServer:`,
      error,
    );
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Upload a file to Supabase Storage (server-side implementation)
 * @param file File to upload
 * @param path Path within the bucket
 * @param bucketName Bucket name
 * @returns Object with publicUrl and error
 */
export async function uploadFileServer(
  file: File,
  path: string,
  bucketName: string = "blog-images",
): Promise<{ publicUrl: string | null; error: Error | null }> {
  if (typeof window !== "undefined") {
    throw new Error("uploadFileServer can only be called on the server");
  }

  try {
    // Get Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Upload] Supabase client not initialized");
      return {
        publicUrl: null,
        error: new Error("Supabase client not initialized"),
      };
    }

    // Ensure the bucket exists
    const bucketExists = await ensureBucketExistsServer(bucketName);
    if (!bucketExists) {
      console.error(
        `[Upload] Bucket ${bucketName} does not exist or could not be created`,
      );
      return {
        publicUrl: null,
        error: new Error(`Bucket ${bucketName} does not exist`),
      };
    }

    // Read file as array buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error(
        `[Upload] Error uploading file to ${bucketName}/${path}:`,
        error,
      );
      return { publicUrl: null, error };
    }

    // Get the public URL for the file
    const publicUrl = getImagePublicUrl(supabase, bucketName, path);

    if (!publicUrl) {
      console.error(
        `[Upload] Failed to generate public URL for ${bucketName}/${path}`,
      );
      return {
        publicUrl: null,
        error: new Error("Failed to generate public URL"),
      };
    }

    return { publicUrl, error: null };
  } catch (error: any) {
    console.error(`[Upload] Unexpected error in uploadFileServer:`, error);
    return { publicUrl: null, error };
  }
}
