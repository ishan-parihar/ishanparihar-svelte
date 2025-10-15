/**
 * Options for configuring image URL normalization
 */
interface ImageUrlOptions {
  fallbackUrl?: string;
  logFixes?: boolean;
  validateUrl?: boolean;
  context?: "blog" | "admin" | "general";
}

/**
 * Default fallback images for different contexts
 */
const DEFAULT_FALLBACK_IMAGES = {
  blog: "/default-blog-image.jpg",
  admin: "/uploads/default-blog-image.jpg",
  general: "/default-blog-image.jpg",
} as const;

/**
 * Get the appropriate default image URL based on context
 *
 * @param context - The context where the image is being used
 * @returns The default fallback image URL
 */
export function getDefaultImageUrl(
  context: "blog" | "admin" | "general" = "general",
): string {
  return DEFAULT_FALLBACK_IMAGES[context];
}

/**
 * Fix problematic Supabase URL patterns
 *
 * @param url - The URL to fix
 * @returns The fixed URL
 */
export function fixSupabaseImageUrl(url: string): string {
  if (!url) return url;

  let fixedUrl = url;

  // Fix problematic URL patterns that cause 404 errors
  if (fixedUrl.includes("/blog-images/blog/public/")) {
    fixedUrl = fixedUrl.replace(
      "/blog-images/blog/public/",
      "/blog-images/public/",
    );
  } else if (fixedUrl.includes("/blog-images/blog/")) {
    fixedUrl = fixedUrl.replace("/blog-images/blog/", "/blog-images/");
  }

  return fixedUrl;
}

/**
 * Validate if an image URL is accessible
 *
 * @param url - The URL to validate
 * @returns Promise that resolves to true if the image is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Main function to normalize and fix image URLs
 * Consolidates all image URL fixing logic from across the codebase
 *
 * @param url - The image URL to normalize (can be null/undefined)
 * @param options - Configuration options for normalization
 * @returns The normalized image URL
 */
export function normalizeImageUrl(
  url: string | null | undefined,
  options: ImageUrlOptions = {},
): string {
  const {
    fallbackUrl,
    logFixes = false,
    validateUrl = false,
    context = "general",
  } = options;

  // Handle null/undefined/empty URLs
  if (!url || typeof url !== "string" || url.trim() === "") {
    const defaultUrl = fallbackUrl || getDefaultImageUrl(context);
    if (logFixes) {
      console.log(
        `🔧 IMAGE UTILS - Using fallback for empty URL: "${defaultUrl}"`,
      );
    }
    return defaultUrl;
  }

  const trimmedUrl = url.trim();

  // If it's already a full URL, apply Supabase fixes if needed
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    const originalUrl = trimmedUrl;
    const fixedUrl = fixSupabaseImageUrl(trimmedUrl);

    if (logFixes && originalUrl !== fixedUrl) {
      console.log(
        `🔧 IMAGE UTILS - FIXED URL: "${originalUrl}" -> "${fixedUrl}"`,
      );
    }

    return fixedUrl;
  }

  // If it's a relative path starting with '/', return as-is
  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  // For other relative paths, use fallback
  const defaultUrl = fallbackUrl || getDefaultImageUrl(context);
  if (logFixes) {
    console.log(
      `🔧 IMAGE UTILS - Using fallback for relative path "${trimmedUrl}": "${defaultUrl}"`,
    );
  }

  return defaultUrl;
}

/**
 * Normalize image URL with validation
 * This is an async version that can validate the URL accessibility
 *
 * @param url - The image URL to normalize
 * @param options - Configuration options for normalization
 * @returns Promise that resolves to the normalized image URL
 */
export async function normalizeImageUrlWithValidation(
  url: string | null | undefined,
  options: ImageUrlOptions = {},
): Promise<string> {
  const normalizedUrl = normalizeImageUrl(url, options);

  if (options.validateUrl) {
    const isValid = await validateImageUrl(normalizedUrl);
    if (!isValid) {
      const fallbackUrl =
        options.fallbackUrl || getDefaultImageUrl(options.context || "general");
      if (options.logFixes) {
        console.warn(
          `🔧 IMAGE UTILS - URL validation failed for "${normalizedUrl}", using fallback: "${fallbackUrl}"`,
        );
      }
      return fallbackUrl;
    }
  }

  return normalizedUrl;
}
