"use client";

import { useEffect } from "react";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Performance monitoring component that tracks Core Web Vitals
 * Only runs in development mode to avoid production overhead
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development mode and in browser
    if (
      process.env.NODE_ENV !== "development" ||
      typeof window === "undefined"
    ) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Function to log performance metrics
    const logMetrics = () => {
      console.group("🚀 Performance Metrics");
      console.log(
        "First Contentful Paint (FCP):",
        metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : "Not available",
      );
      console.log(
        "Largest Contentful Paint (LCP):",
        metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : "Not available",
      );
      console.log(
        "Time to First Byte (TTFB):",
        metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : "Not available",
      );
      console.groupEnd();
    };

    // Simple performance monitoring
    try {
      // Measure TTFB using Navigation Timing API
      if ("performance" in window && "getEntriesByType" in performance) {
        const navigationEntries = performance.getEntriesByType(
          "navigation",
        ) as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        }
      }

      // Basic paint metrics
      if ("PerformanceObserver" in window) {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              metrics.fcp = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ["paint"] });

        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // Log metrics after page load
        window.addEventListener("load", () => {
          setTimeout(logMetrics, 1000);
        });

        // Cleanup
        return () => {
          paintObserver.disconnect();
          lcpObserver.disconnect();
        };
      }
    } catch (error) {
      console.warn("Performance monitoring failed:", error);
    }
  }, []);

  return null;
}

/**
 * Bundle size monitoring utility
 * Logs information about loaded JavaScript chunks
 */
export function BundleMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Monitor script loading
    const scripts = document.querySelectorAll("script[src]");
    let totalSize = 0;

    console.group("📦 Bundle Information");
    console.log(`Total script tags: ${scripts.length}`);

    scripts.forEach((script, index) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes("/_next/static/")) {
        console.log(`Script ${index + 1}:`, src.split("/").pop());
      }
    });

    console.groupEnd();

    // Monitor resource loading
    if ("PerformanceObserver" in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes("/_next/static/chunks/")) {
            const size = (entry as PerformanceResourceTiming).transferSize;
            if (size) {
              totalSize += size;
              console.log(
                `📦 Loaded chunk: ${entry.name.split("/").pop()} (${(size / 1024).toFixed(2)} KB)`,
              );
            }
          }
        }
      });
      resourceObserver.observe({ entryTypes: ["resource"] });

      return () => resourceObserver.disconnect();
    }
  }, []);

  return null;
}
