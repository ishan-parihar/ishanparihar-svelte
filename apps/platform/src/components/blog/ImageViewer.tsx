"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageViewer } from "@/contexts/ImageViewerContext";
import { useTheme } from "next-themes";
import {
  ZoomState,
  preloadImage,
  constrainZoomState,
} from "@/lib/imageViewerUtils";

export function ImageViewer() {
  const {
    isOpen,
    currentImage,
    currentIndex,
    totalImages,
    hasNext,
    hasPrevious,
    closeViewer,
    goToNext,
    goToPrevious,
  } = useImageViewer();

  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    zoomX: 0,
    zoomY: 0,
  });
  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    if (currentImage) {
      setIsLoading(true);
      setImageError(false);
      setIsDragging(false); // Reset dragging state

      preloadImage(currentImage.src)
        .then((img) => {
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          setImageDimensions(dimensions);
          setZoomState({ scale: 1, x: 0, y: 0 });
          setIsLoading(false);
        })
        .catch(() => {
          setImageError(true);
          setIsLoading(false);
        });
    }
  }, [currentImage]);

  // Reset dragging state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDragging(false);
    }
  }, [isOpen]);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isOpen]);

  // Subtle scroll management - only prevent scrolling, don't change position
  useEffect(() => {
    if (isOpen) {
      // Simply prevent body scroll without changing position
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Cleanup function to restore original state
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }
    };

    const handleArrowKeys = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && hasPrevious) {
        goToPrevious();
      } else if (event.key === "ArrowRight" && hasNext) {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("keydown", handleArrowKeys);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("keydown", handleArrowKeys);
    };
  }, [isOpen, closeViewer, hasNext, hasPrevious, goToNext, goToPrevious]);

  // Handle browser back button (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      closeViewer();
    };

    // Push a dummy state when modal opens
    window.history.pushState({ imageViewerOpen: true }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up the dummy state if modal is still open
      if (window.history.state?.imageViewerOpen) {
        window.history.back();
      }
    };
  }, [isOpen, closeViewer]);

  // Zoom functions
  const zoomIn = () => {
    setZoomState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.5, 5),
    }));
  };

  const zoomOut = () => {
    setZoomState((prev) => {
      const newScale = Math.max(prev.scale / 1.5, 0.5);
      return {
        ...prev,
        scale: newScale,
        // Reset position if zooming out to fit
        x: newScale <= 1 ? 0 : prev.x,
        y: newScale <= 1 ? 0 : prev.y,
      };
    });
  };

  const resetZoom = () => {
    setZoomState({ scale: 1, x: 0, y: 0 });
  };

  // Pan/drag functions
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomState.scale <= 1) return;

      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        zoomX: zoomState.x,
        zoomY: zoomState.y,
      });
    },
    [zoomState.scale, zoomState.x, zoomState.y],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || zoomState.scale <= 1) return;

      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newZoomState = {
        scale: zoomState.scale,
        x: dragStart.zoomX + deltaX,
        y: dragStart.zoomY + deltaY,
      };

      // Apply constraints to prevent dragging outside bounds
      const constrainedState = constrainZoomState(
        newZoomState,
        containerDimensions.width,
        containerDimensions.height,
        imageDimensions.width,
        imageDimensions.height,
      );

      setZoomState(constrainedState);
    },
    [
      isDragging,
      zoomState.scale,
      dragStart,
      containerDimensions,
      imageDimensions,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoomState.scale <= 1 || e.touches.length !== 1) return;

      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        zoomX: zoomState.x,
        zoomY: zoomState.y,
      });
    },
    [zoomState.scale, zoomState.x, zoomState.y],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || zoomState.scale <= 1 || e.touches.length !== 1) return;

      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;

      const newZoomState = {
        scale: zoomState.scale,
        x: dragStart.zoomX + deltaX,
        y: dragStart.zoomY + deltaY,
      };

      // Apply constraints to prevent dragging outside bounds
      const constrainedState = constrainZoomState(
        newZoomState,
        containerDimensions.width,
        containerDimensions.height,
        imageDimensions.width,
        imageDimensions.height,
      );

      setZoomState(constrainedState);
    },
    [
      isDragging,
      zoomState.scale,
      dragStart,
      containerDimensions,
      imageDimensions,
    ],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event listeners for dragging outside the image
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || zoomState.scale <= 1) return;

      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newZoomState = {
        scale: zoomState.scale,
        x: dragStart.zoomX + deltaX,
        y: dragStart.zoomY + deltaY,
      };

      // Apply constraints to prevent dragging outside bounds
      const constrainedState = constrainZoomState(
        newZoomState,
        containerDimensions.width,
        containerDimensions.height,
        imageDimensions.width,
        imageDimensions.height,
      );

      setZoomState(constrainedState);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDragging,
    zoomState.scale,
    dragStart,
    containerDimensions,
    imageDimensions,
  ]);

  if (!isOpen) return null;

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      closeViewer();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-sm z-50 ${
          isDark ? "bg-black/95" : "bg-white/95"
        }`}
        onClick={handleBackdropClick}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            closeViewer();
          }}
          className={`absolute top-4 right-4 z-10 border-0 rounded-none ${
            isDark
              ? "text-white hover:bg-white/10"
              : "text-black hover:bg-black/10"
          }`}
          aria-label="Close image viewer"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 border-0 rounded-none ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 border-0 rounded-none ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            }`}
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Zoom controls */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-none p-2 ${
            isDark ? "bg-black/50" : "bg-white/50"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            className={`border-0 rounded-none min-w-[44px] min-h-[44px] p-2 flex items-center justify-center transition-colors ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            }`}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className={`border-0 rounded-none min-w-[44px] min-h-[44px] p-2 flex items-center justify-center transition-colors ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            }`}
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            className={`border-0 rounded-none min-w-[44px] min-h-[44px] p-2 flex items-center justify-center transition-colors ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            }`}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Image counter and zoom level */}
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 text-sm px-3 py-1 rounded-none ${
            isDark ? "text-white bg-black/50" : "text-black bg-white/50"
          }`}
        >
          {totalImages > 1 && (
            <span>
              {currentIndex + 1} / {totalImages} •{" "}
            </span>
          )}
          <span>Zoom: {Math.round(zoomState.scale * 100)}%</span>
        </div>

        {/* Image container - positioned absolutely to not interfere with backdrop clicks */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        >
          {isLoading && (
            <div
              className={`text-lg pointer-events-none ${isDark ? "text-white" : "text-black"}`}
            >
              Loading...
            </div>
          )}

          {imageError && (
            <div
              className={`text-lg pointer-events-none ${isDark ? "text-white" : "text-black"}`}
            >
              Failed to load image
            </div>
          )}

          {currentImage && !isLoading && !imageError && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: zoomState.scale,
                opacity: 1,
                x: zoomState.x,
                y: zoomState.y,
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative pointer-events-auto select-none"
              style={{
                cursor:
                  zoomState.scale > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                transformOrigin: "center center",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                ref={imageRef}
                src={currentImage.src}
                alt={currentImage.alt}
                width={imageDimensions.width || 800}
                height={imageDimensions.height || 600}
                className="block"
                style={{
                  maxWidth: `${containerDimensions.width - 32}px`,
                  maxHeight: `${containerDimensions.height - 32}px`,
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
                priority
                draggable={false}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
