/**
 * Utility functions for the image viewer component
 */
import React from "react";

export interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

export interface TouchState {
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  lastTouchX: number;
  lastTouchY: number;
}

/**
 * Calculate the distance between two touch points
 */
export function getTouchDistance(
  touch1: React.Touch,
  touch2: React.Touch,
): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the center point between two touches
 */
export function getTouchCenter(
  touch1: React.Touch,
  touch2: React.Touch,
): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate zoom constraints based on container and image dimensions
 */
export function calculateZoomConstraints(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): { minScale: number; maxScale: number } {
  // Calculate the scale needed to fit the image in the container
  const scaleToFitWidth = containerWidth / imageWidth;
  const scaleToFitHeight = containerHeight / imageHeight;
  const minScale = Math.min(scaleToFitWidth, scaleToFitHeight, 1);

  // Maximum zoom is 3x the original size or 5x the fit size, whichever is larger
  const maxScale = Math.max(3, minScale * 5);

  return { minScale, maxScale };
}

/**
 * Calculate pan constraints to keep the image within bounds when zoomed
 */
export function calculatePanConstraints(
  scale: number,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): { minX: number; maxX: number; minY: number; maxY: number } {
  const scaledImageWidth = imageWidth * scale;
  const scaledImageHeight = imageHeight * scale;

  // If the scaled image is smaller than the container, center it
  if (scaledImageWidth <= containerWidth) {
    const centerX = (containerWidth - scaledImageWidth) / 2;
    return {
      minX: centerX,
      maxX: centerX,
      minY:
        scaledImageHeight <= containerHeight
          ? (containerHeight - scaledImageHeight) / 2
          : -(scaledImageHeight - containerHeight) / 2,
      maxY:
        scaledImageHeight <= containerHeight
          ? (containerHeight - scaledImageHeight) / 2
          : (scaledImageHeight - containerHeight) / 2,
    };
  }

  if (scaledImageHeight <= containerHeight) {
    const centerY = (containerHeight - scaledImageHeight) / 2;
    return {
      minX: -(scaledImageWidth - containerWidth) / 2,
      maxX: (scaledImageWidth - containerWidth) / 2,
      minY: centerY,
      maxY: centerY,
    };
  }

  return {
    minX: -(scaledImageWidth - containerWidth) / 2,
    maxX: (scaledImageWidth - containerWidth) / 2,
    minY: -(scaledImageHeight - containerHeight) / 2,
    maxY: (scaledImageHeight - containerHeight) / 2,
  };
}

/**
 * Apply constraints to zoom state
 */
export function constrainZoomState(
  zoomState: ZoomState,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): ZoomState {
  const { minScale, maxScale } = calculateZoomConstraints(
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
  );

  const constrainedScale = clamp(zoomState.scale, minScale, maxScale);

  const { minX, maxX, minY, maxY } = calculatePanConstraints(
    constrainedScale,
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
  );

  return {
    scale: constrainedScale,
    x: clamp(zoomState.x, minX, maxX),
    y: clamp(zoomState.y, minY, maxY),
  };
}

/**
 * Get the initial zoom state for an image
 */
export function getInitialZoomState(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): ZoomState {
  const { minScale } = calculateZoomConstraints(
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
  );

  return {
    scale: minScale,
    x: 0,
    y: 0,
  };
}

/**
 * Preload an image and return a promise that resolves when loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Extract images from a DOM element (for collecting blog post images)
 * Fixed to preserve original source URLs instead of resolved URLs to avoid localhost issues
 */
export function extractImagesFromElement(
  element: HTMLElement,
): Array<{ src: string; alt: string; width?: number; height?: number }> {
  const images = element.querySelectorAll("img");
  return Array.from(images).map((img) => {
    // First, try to get the original src from data attribute (set by CustomImage component)
    let originalSrc = img.getAttribute("data-original-src");

    // If no data attribute, try to get the original src attribute instead of the resolved img.src property
    if (!originalSrc) {
      originalSrc = img.getAttribute("src") || img.src;
    }

    // If the src starts with /_next/image, extract the original URL from the query parameter
    if (originalSrc && originalSrc.includes("/_next/image?url=")) {
      try {
        const url = new URL(originalSrc, window.location.origin);
        const urlParam = url.searchParams.get("url");
        if (urlParam) {
          originalSrc = decodeURIComponent(urlParam);
        }
      } catch (error) {
        console.warn(
          "Failed to extract original URL from Next.js optimized image:",
          error,
        );
        // Fallback to the resolved src if extraction fails
        originalSrc = img.src;
      }
    }

    return {
      src: originalSrc || img.src,
      alt: img.alt || "",
      width: img.naturalWidth || undefined,
      height: img.naturalHeight || undefined,
    };
  });
}
