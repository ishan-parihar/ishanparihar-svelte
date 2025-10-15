/**
 * Centralized slug generation utilities for blog posts
 * Ensures consistent URL generation across the application
 */

/**
 * SEO-optimized slug generation function
 * Removes stop words, limits to 5 words, and creates clean URLs
 *
 * @param title - The blog post title to convert to a slug
 * @returns SEO-optimized slug string
 */
export function generateSEOSlug(title: string): string {
  // Words to remove for SEO optimization
  const stopWords = [
    "the",
    "and",
    "a",
    "an",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "shall",
  ];

  return (
    title
      .toLowerCase()
      .trim()
      // Remove special characters except hyphens and spaces
      .replace(/[^\w\s-]/g, "")
      // Split into words
      .split(/\s+/)
      // Remove stop words
      .filter((word) => !stopWords.includes(word))
      // Take only first 5 words for SEO optimization
      .slice(0, 5)
      // Join with hyphens
      .join("-")
      // Remove any double hyphens
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, "")
  );
}

/**
 * Simple slug generation function (legacy)
 * Used for backward compatibility where needed
 *
 * @param title - The blog post title to convert to a slug
 * @returns Simple slug string
 */
export function generateSimpleSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Default slug generation function
 * Uses SEO-optimized generation by default
 *
 * @param title - The blog post title to convert to a slug
 * @returns SEO-optimized slug string
 */
export function generateSlug(title: string): string {
  return generateSEOSlug(title);
}

/**
 * Validates if a slug is properly formatted
 *
 * @param slug - The slug to validate
 * @returns boolean indicating if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug contains only lowercase letters, numbers, and hyphens
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Sanitizes a slug to ensure it meets requirements
 *
 * @param slug - The slug to sanitize
 * @returns Sanitized slug string
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100); // Limit length
}
