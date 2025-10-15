"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface ImageViewerImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ImageViewerContextType {
  // State
  isOpen: boolean;
  images: ImageViewerImage[];
  currentIndex: number;

  // Actions
  openViewer: (images: ImageViewerImage[], index: number) => void;
  closeViewer: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;

  // Computed values
  currentImage: ImageViewerImage | null;
  hasNext: boolean;
  hasPrevious: boolean;
  totalImages: number;
}

const ImageViewerContext = createContext<ImageViewerContextType | undefined>(
  undefined,
);

interface ImageViewerProviderProps {
  children: ReactNode;
}

export function ImageViewerProvider({ children }: ImageViewerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageViewerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openViewer = useCallback(
    (newImages: ImageViewerImage[], index: number) => {
      setImages(newImages);
      setCurrentIndex(Math.max(0, Math.min(index, newImages.length - 1)));
      setIsOpen(true);
    },
    [],
  );

  const closeViewer = useCallback(() => {
    setIsOpen(false);
    // Small delay before clearing images to allow for exit animations
    setTimeout(() => {
      setImages([]);
      setCurrentIndex(0);
    }, 300);
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [images.length],
  );

  const currentImage = images[currentIndex] || null;
  const hasNext = currentIndex < images.length - 1;
  const hasPrevious = currentIndex > 0;
  const totalImages = images.length;

  const value: ImageViewerContextType = {
    isOpen,
    images,
    currentIndex,
    openViewer,
    closeViewer,
    goToNext,
    goToPrevious,
    goToIndex,
    currentImage,
    hasNext,
    hasPrevious,
    totalImages,
  };

  return (
    <ImageViewerContext.Provider value={value}>
      {children}
    </ImageViewerContext.Provider>
  );
}

export function useImageViewer() {
  const context = useContext(ImageViewerContext);
  if (context === undefined) {
    throw new Error(
      "useImageViewer must be used within an ImageViewerProvider",
    );
  }
  return context;
}
