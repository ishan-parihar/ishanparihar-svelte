"use client";

import React from "react";

/**
 * A lightweight hook for debugging component render performance during development.
 * Logs the time from mount to first paint and subsequent render durations.
 * This hook does nothing in production builds.
 * @param componentName The name of the component to log.
 */
export function usePerformanceMonitor(componentName: string) {
  const mountTime = React.useRef(performance.now());
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && !isMounted.current) {
      const timeToFirstPaint = performance.now() - mountTime.current;
      console.log(
        `🚀 [Perf] ${componentName} mounted in: ${timeToFirstPaint.toFixed(2)}ms`,
      );
      isMounted.current = true;
    }
  }, [componentName]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && isMounted.current) {
      const start = performance.now();
      // We use a timeout to ensure this runs after the render commit phase
      setTimeout(() => {
        const end = performance.now();
        console.log(
          `🎨 [Perf] ${componentName} render duration: ${(end - start).toFixed(2)}ms`,
        );
      }, 0);
    }
  });
}
