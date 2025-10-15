"use client";

import { useEffect, useRef } from "react";
import {
  useImageViewer as useImageViewerContext,
  ImageViewerImage,
} from "@/contexts/ImageViewerContext";
import { extractImagesFromElement } from "@/lib/imageViewerUtils";

/**
 * Hook to automatically collect images from a container element and set up image viewer
 */
export function useImageCollection(containerRef: React.RefObject<HTMLElement>) {
  const { openViewer } = useImageViewerContext();
  const imagesRef = useRef<ImageViewerImage[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Function to collect images and set up click handlers
    const setupImageViewer = () => {
      const images = extractImagesFromElement(container);
      imagesRef.current = images;

      // Add click handlers to all images
      const imageElements = container.querySelectorAll("img");
      imageElements.forEach((img, index) => {
        const handleImageClick = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          openViewer(images, index);
        };

        // Remove existing listener if any
        img.removeEventListener("click", handleImageClick);
        // Add new listener
        img.addEventListener("click", handleImageClick);

        // Add cursor pointer style
        img.style.cursor = "pointer";

        // Store the handler for cleanup
        (img as any).__imageViewerHandler = handleImageClick;
      });
    };

    // Initial setup
    setupImageViewer();

    // Set up mutation observer to handle dynamically added images
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === "IMG" || element.querySelector("img")) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        setupImageViewer();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Cleanup function
    return () => {
      observer.disconnect();

      // Remove all click handlers
      const imageElements = container.querySelectorAll("img");
      imageElements.forEach((img) => {
        const handler = (img as any).__imageViewerHandler;
        if (handler) {
          img.removeEventListener("click", handler);
          delete (img as any).__imageViewerHandler;
        }
        img.style.cursor = "";
      });
    };
  }, [containerRef, openViewer]);

  return imagesRef.current;
}

/**
 * Hook to manually open image viewer with specific images
 */
export function useManualImageViewer() {
  const { openViewer, closeViewer, isOpen } = useImageViewerContext();

  const openImageViewer = (
    images: ImageViewerImage[],
    startIndex: number = 0,
  ) => {
    openViewer(images, startIndex);
  };

  const openSingleImage = (
    src: string,
    alt: string = "",
    width?: number,
    height?: number,
  ) => {
    openViewer([{ src, alt, width, height }], 0);
  };

  return {
    openImageViewer,
    openSingleImage,
    closeViewer,
    isOpen,
  };
}

/**
 * Re-export the main context hook for convenience
 */
export { useImageViewer as useImageViewerContext } from "@/contexts/ImageViewerContext";
