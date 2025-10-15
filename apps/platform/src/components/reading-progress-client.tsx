"use client";

import { useEffect, useRef } from "react";

export function ReadingProgressClient() {
  const rafId = useRef<number | undefined>(undefined);
  const lastProgress = useRef<number>(-1);

  useEffect(() => {
    // Get the progress bar element
    const progressBar = document.querySelector(
      ".reading-progress-bar",
    ) as HTMLElement;
    if (!progressBar) return;

    // Set transition once during initialization for smooth animation
    progressBar.style.transition = "transform 0.1s ease-out";
    progressBar.style.willChange = "transform";

    // Calculate reading progress
    const calculateReadingProgress = (): number => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0
        ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
        : 0;
    };

    // Optimized update function with throttling
    const updateReadingProgress = () => {
      const currentProgress = calculateReadingProgress();

      // Only update if progress has changed significantly (reduces unnecessary updates)
      if (Math.abs(currentProgress - lastProgress.current) > 0.1) {
        lastProgress.current = currentProgress;

        // Use transform3d for hardware acceleration and smoother animation
        progressBar.style.transform = `translate3d(${currentProgress - 100}%, 0, 0)`;
      }
    };

    // Throttled scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(updateReadingProgress);
    };

    // Add optimized scroll event listener with passive flag for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize progress
    updateReadingProgress();

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything, it just adds interactivity
}
