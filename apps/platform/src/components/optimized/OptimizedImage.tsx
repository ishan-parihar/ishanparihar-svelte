"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { createClient } from "@/utils/supabase/client";
import {
  getOptimizedBlogCoverImageUrl,
  getOptimizedImageUrl,
} from "@/lib/imageService.client";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
  optimizationContext?: "blog" | "admin" | "general";
  bucketName?: string;
}

/**
 * Base optimized image component that handles Supabase image optimization
 */
function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/default-image.jpg",
  optimizationContext = "general",
  bucketName,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useOriginalUrl, setUseOriginalUrl] = useState(false);

  // Normalize and optimize the image URL
  const getOptimizedSrc = () => {
    if (!src || imageError) {
      return fallbackSrc;
    }

    // Normalize the URL first
    const normalizedUrl = normalizeImageUrl(src, {
      fallbackUrl: fallbackSrc,
      context: optimizationContext,
    });

    console.log("[OptimizedImage] Processing image:", {
      original: src,
      normalized: normalizedUrl,
      useOriginalUrl,
      imageError
    });



    // If it's a Supabase URL, try to optimize it
    if (
      normalizedUrl.includes("supabase.co") &&
      optimizationContext === "blog"
    ) {
      const supabase = createClient();
      try {
        const optimizedUrl = getOptimizedBlogCoverImageUrl(
          supabase,
          src,
          "medium",
        );
        return optimizedUrl || normalizedUrl;
      } catch (error) {
        console.warn(
          "[OptimizedImage] Failed to generate optimized URL, falling back to original:",
          error,
        );
        return normalizedUrl;
      }
    }

    return normalizedUrl;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.warn("[OptimizedImage] Image failed to load:", getOptimizedSrc());

    // If we haven't tried the original URL yet, try it
    if (
      !useOriginalUrl &&
      src &&
      src.includes("supabase.co") &&
      src.includes("/render/image/")
    ) {
      console.log("[OptimizedImage] Trying original URL instead of optimized");
      setUseOriginalUrl(true);
      setIsLoading(true);
      return;
    }

    // If original URL also failed, show fallback
    console.log("[OptimizedImage] Using fallback image");
    setImageError(true);
    setIsLoading(false);
  };

  // Check if we have width/height props or if we should use fill
  const hasExplicitDimensions = props.width && props.height;
  const shouldUseFill = !hasExplicitDimensions;

  // For images with explicit dimensions, render directly without complex loading states
  if (hasExplicitDimensions) {
    return (
      <Image
        src={getOptimizedSrc()}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={props.width}
        height={props.height}
        sizes={props.sizes}
        {...props}
      />
    );
  }

  // For fill images, use the wrapper div
  return (
    <div
      className={`relative ${isLoading ? "animate-pulse bg-gray-200 dark:bg-gray-800" : ""}`}
    >
      <Image
        src={getOptimizedSrc()}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        fill={shouldUseFill}
        sizes={
          shouldUseFill
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            : undefined
        }
        {...props}
      />
    </div>
  );
}

/**
 * Optimized image component specifically for blog content
 */
export function BlogImage({
  src,
  alt,
  width = 800,
  height = 450,
  className = "w-full h-auto my-8",
  priority = false,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt || ""}
      width={width}
      height={height}
      className={className}
      priority={priority}
      optimizationContext="blog"
      fallbackSrc="/default-blog-image.jpg"
      {...props}
    />
  );
}

/**
 * Optimized image component for service and general cover images
 */
export function CoverImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  priority = false,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  // For cover images, we typically want to fill the container
  // Only pass width/height if explicitly provided
  const imageProps = width && height ? { width, height } : {};

  return (
    <OptimizedImage
      src={src}
      alt={alt || ""}
      className={className}
      priority={priority}
      optimizationContext="general"
      fallbackSrc="/default-service-image.jpg"
      {...imageProps}
      {...props}
    />
  );
}

/**
 * Optimized image component for profile images
 */
export function ProfileImage({
  src,
  alt,
  size = 48,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt || "Profile"}
      width={size}
      height={size}
      className={`rounded-full ${className || ""}`}
      optimizationContext="general"
      fallbackSrc="/default-avatar.jpg"
      {...props}
    />
  );
}

// Default export for backward compatibility
export default OptimizedImage;
