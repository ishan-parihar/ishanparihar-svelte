/**
 * Performance monitoring utilities for tracking blog loading performance
 * This module provides functions to measure and log performance metrics
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Enable performance monitoring in development or when explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === "development" ||
      process.env.ENABLE_PERFORMANCE_MONITORING === "true";
  }

  /**
   * Start timing a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);

    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [Performance] Started timing: ${name}`);
    }
  }

  /**
   * End timing a performance metric and log the result
   */
  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ [Performance] No metric found for: ${name}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Merge additional metadata
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.logMetric(metric);
    this.metrics.delete(name);

    return metric.duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>,
  ): Promise<T> {
    if (!this.isEnabled) {
      return await fn();
    }

    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Log a performance metric with appropriate formatting
   */
  private logMetric(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    const duration = metric.duration.toFixed(2);
    const emoji = this.getPerformanceEmoji(metric.duration);

    let logMessage = `${emoji} [Performance] ${metric.name}: ${duration}ms`;

    if (metric.metadata) {
      const metadataStr = Object.entries(metric.metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      logMessage += ` (${metadataStr})`;
    }

    // Use different log levels based on performance
    if (metric.duration > 5000) {
      console.error(logMessage);
    } else if (metric.duration > 1000) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Get appropriate emoji based on performance duration
   */
  private getPerformanceEmoji(duration: number): string {
    if (duration < 100) return "⚡"; // Very fast
    if (duration < 500) return "🚀"; // Fast
    if (duration < 1000) return "✅"; // Good
    if (duration < 2000) return "⚠️"; // Slow
    if (duration < 5000) return "🐌"; // Very slow
    return "🔥"; // Critical
  }

  /**
   * Get all current metrics (for debugging)
   */
  getCurrentMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for easier usage
export const startTiming = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.start(name, metadata);

export const endTiming = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.end(name, metadata);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
) => performanceMonitor.measure(name, fn, metadata);

export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>,
) => performanceMonitor.measure(name, fn, metadata);

/**
 * Higher-order function to automatically measure function execution time
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  metadata?: Record<string, any>,
): T {
  return ((...args: any[]) => {
    return performanceMonitor.measure(name, () => fn(...args), metadata);
  }) as T;
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitoring(componentName: string) {
  if (typeof window === "undefined") return; // Server-side, skip

  const startTime = performance.now();

  // Use useEffect to measure render time
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === "development") {
        console.log(`🎨 [Render] ${componentName}: ${duration.toFixed(2)}ms`);
      }
    });
  }
}

/**
 * Web Vitals integration for production monitoring
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === "production") {
    // In production, you might want to send this to an analytics service
    console.log(`📊 [WebVitals] ${metric.name}: ${metric.value}`);
  }
}
