// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private observers: IntersectionObserver[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure performance of a function
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;
      
      this.metrics.set(name, {
        duration,
        timestamp: Date.now(),
        status: 'success'
      });
      
      console.log(`Performance measurement for ${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      this.metrics.set(name, {
        duration,
        timestamp: Date.now(),
        status: 'error',
        error: (error as Error).message
      });
      
      console.error(`Performance measurement error for ${name}:`, error);
      throw error;
    }
  }

  // Measure Core Web Vitals
  measureCoreWebVitals() {
    if ('measure' in performance) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', {
          value: lastEntry.startTime,
          rating: this.getRating(lastEntry.startTime, 2500, 4000)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID) - using First Input Observer for correct property access
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number };
            if (fidEntry.processingStart !== undefined) {
              this.metrics.set('FID', {
                value: fidEntry.processingStart - fidEntry.startTime,
                rating: this.getRating(fidEntry.processingStart - fidEntry.startTime, 100, 300)
              });
            }
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
            if (!clsEntry.hadRecentInput && clsEntry.value !== undefined) {
              clsValue += clsEntry.value;
            }
          }
        }
        this.metrics.set('CLS', {
          value: clsValue,
          rating: this.getRating(clsValue, 0.1, 0.25)
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Lazy loading for images and components
  lazyLoadImage(
    element: HTMLImageElement,
    src: string,
    callback?: (success: boolean) => void
  ) {
    if (!element) return;

    const img = new Image();
    img.onload = () => {
      element.src = src;
      element.classList.add('loaded');
      callback?.(true);
    };
    img.onerror = () => {
      callback?.(false);
    };
    img.src = src;
  }

  // Lazy load component when it comes into view
  lazyLoadComponent(
    element: HTMLElement,
    loadFn: () => Promise<any>,
    options?: IntersectionObserverInit
  ) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadFn().catch(console.error);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(element);
    this.observers.push(observer);
 }

  // Get performance metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
 }

  // Helper to determine rating based on thresholds
  private getRating(value: number, goodThreshold: number, needsImprovementThreshold: number): string {
    if (value <= goodThreshold) return 'good';
    if (value <= needsImprovementThreshold) return 'needs-improvement';
    return 'poor';
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize core web vitals monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measureCoreWebVitals();
}