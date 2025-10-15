"use client";

import dynamic from "next/dynamic";

// Dynamically import performance monitoring components
const PerformanceMonitor = dynamic(
  () =>
    import("./PerformanceMonitor").then((mod) => ({
      default: mod.PerformanceMonitor,
    })),
  { ssr: false },
);

const BundleMonitor = dynamic(
  () =>
    import("./PerformanceMonitor").then((mod) => ({
      default: mod.BundleMonitor,
    })),
  { ssr: false },
);

/**
 * Client wrapper for performance monitoring components
 * Only loads in development mode
 */
export function PerformanceWrapper() {
  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      <PerformanceMonitor />
      <BundleMonitor />
    </>
  );
}
