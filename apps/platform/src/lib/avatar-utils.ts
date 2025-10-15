/**
 * Utility functions for handling user avatars
 */

import { getOptimizedProfileImageUrl } from "@/lib/imageService.client";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

// Use a stable timestamp for the entire session to prevent constant re-fetching
// This will be initialized once when the module is loaded
const SESSION_TIMESTAMP = Date.now();

/**
 * Generate a default avatar URL based on user information
 * Uses DiceBear API to create a consistent avatar based on the user's email or name
 *
 * @param email User's email
 * @param name User's name (optional)
 * @returns URL to a generated avatar
 */
export function generateDefaultAvatar(email: string, name?: string): string {
  // Use name if available, otherwise use email
  const seed = (name || email).toLowerCase().replace(/[^a-z0-9]/g, "");

  // Use DiceBear Personas style with consistent styling
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6ccfe,c9b6fb,f5c6ff&backgroundType=gradientLinear`;
}

/**
 * Add a stable cache-busting parameter to a URL
 * Uses the same timestamp for the entire session to prevent flickering
 *
 * @param url The URL to add the cache-busting parameter to
 * @returns The URL with a stable cache-busting parameter
 */
function addStableCacheBuster(url: string): string {
  if (!url) return url;

  // Use the session timestamp instead of generating a new one each time
  const cacheBuster = url.includes("?")
    ? `&t=${SESSION_TIMESTAMP}`
    : `?t=${SESSION_TIMESTAMP}`;
  return `${url}${cacheBuster}`;
}

/**
 * Get the appropriate profile picture URL based on user data and login type
 *
 * @param user User object with profile information
 * @param size Size preset for optimized images ('small', 'medium', 'large', 'xl')
 * @returns The appropriate profile picture URL
 */
export function getProfilePicture(
  user: {
    email: string;
    name?: string;
    picture?: string;
    image?: string;
    custom_picture?: boolean;
    provider?: string;
  },
  size: "small" | "medium" | "large" | "xl" = "medium",
): string {
  // Add caller information to help trace the source
  const stack = new Error().stack;
  const caller = stack ? stack.split("\n")[2] : "unknown";

  // Log the input for debugging with caller information
  console.log(`getProfilePicture input (called from ${caller}):`, {
    email: user.email,
    name: user.name,
    picture: user.picture
      ? user.picture.length > 30
        ? user.picture.substring(0, 30) + "..."
        : user.picture
      : undefined,
    image: user.image
      ? user.image.length > 30
        ? user.image.substring(0, 30) + "..."
        : user.image
      : undefined,
    custom_picture: user.custom_picture,
    provider: user.provider,
  });

  // Case 1: User has a custom picture (manually uploaded)
  if (user.custom_picture === true && user.picture) {
    console.log("Using custom uploaded picture with optimization");

    // Check if this is a Supabase-stored custom picture (contains user-uploads bucket path)
    if (
      user.picture.includes("user-uploads") ||
      user.picture.includes("/storage/v1/object/")
    ) {
      try {
        // Extract the file path from the Supabase URL
        let imagePath = user.picture;

        // If it's a full Supabase URL, extract just the path
        if (imagePath.includes("/storage/v1/object/public/user-uploads/")) {
          imagePath = imagePath.split(
            "/storage/v1/object/public/user-uploads/",
          )[1];
        } else if (imagePath.includes("user-uploads/")) {
          imagePath = imagePath.split("user-uploads/")[1];
        }

        // Use the image service for optimization
        const supabase = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const optimizedUrl = getOptimizedProfileImageUrl(
          supabase,
          imagePath,
          size,
        );

        if (optimizedUrl) {
          console.log(
            `Generated optimized avatar URL for size ${size}:`,
            optimizedUrl,
          );
          return optimizedUrl;
        }
      } catch (error) {
        console.warn(
          "Failed to optimize custom profile picture, falling back to original:",
          error,
        );
      }
    }

    // Fallback for non-Supabase custom pictures or if optimization fails
    return user.picture.includes("?t=") || user.picture.includes("&t=")
      ? user.picture
      : addStableCacheBuster(user.picture);
  }

  // Case 2: User is logged in with Google and doesn't have a custom picture
  if (user.provider === "google" && user.custom_picture !== true) {
    console.log("Google login detected, looking for Google profile picture");

    // For Google logins, prioritize the image property from NextAuth session
    // This is typically set directly from the OAuth profile
    if (user.image) {
      console.log("Using Google profile image from session.user.image");
      return addStableCacheBuster(user.image);
    }
    // Fallback to picture property if available and not a generated avatar
    else if (user.picture && !user.picture.includes("dicebear")) {
      console.log("Using Google profile image from picture property");
      return addStableCacheBuster(user.picture);
    }
    // Special fallback for Google users: try to generate a Google profile picture URL
    else if (user.email && user.email.includes("@gmail.com")) {
      console.log(
        "Attempting to generate Google profile picture URL from Gmail address",
      );
      // Note: This is a fallback that may not always work, but worth trying
      // Google profile pictures are typically available at specific URLs
      const googleProfileUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
      console.log("Using default Google profile picture as fallback");
      return addStableCacheBuster(googleProfileUrl);
    }
  }

  // Case 3: If user has a picture that's not a custom picture and not a dicebear avatar
  if (
    user.picture &&
    !user.picture.includes("dicebear") &&
    user.custom_picture !== true
  ) {
    console.log("Using non-custom, non-generated picture");
    return addStableCacheBuster(user.picture);
  }

  // Case 4: If user has an image property (from NextAuth) that's not already used
  if (user.image && !user.custom_picture) {
    console.log("Using image property as fallback");
    return addStableCacheBuster(user.image);
  }

  // Case 5: Default to generated avatar for email logins or when no other picture is available
  console.log("Generating default avatar");
  return generateDefaultAvatar(user.email, user.name);
}

/**
 * Get avatar URL for a user, with fallback to generated avatar
 *
 * @param user User object with optional picture
 * @returns URL to user's avatar or generated avatar
 */
export function getUserAvatar(user: {
  email: string;
  name?: string;
  picture?: string;
}): string {
  if (user.picture) {
    // Use the stable cache buster for consistency with getProfilePicture
    return user.picture.includes("?t=") || user.picture.includes("&t=")
      ? user.picture
      : addStableCacheBuster(user.picture);
  }

  return generateDefaultAvatar(user.email, user.name);
}
