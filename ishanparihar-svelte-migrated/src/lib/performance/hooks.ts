// Performance monitoring hooks for SvelteKit
import { performanceMonitor } from './monitoring';

// Hook to measure page load performance
export function trackPageLoad(pageName: string) {
  if (typeof window !== 'undefined') {
    // Measure DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        performanceMonitor.measure(`${pageName}-dom-content-loaded`, async () => {
          // Just measuring the timing
          return Promise.resolve();
        });
      });
    } else {
      performanceMonitor.measure(`${pageName}-dom-content-loaded`, async () => {
        return Promise.resolve();
      });
    }

    // Measure full page load
    window.addEventListener('load', () => {
      performanceMonitor.measure(`${pageName}-page-load`, async () => {
        return Promise.resolve();
      });
    });

    // Track hydration time if using a framework that hydrates
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        performanceMonitor.measure(`${pageName}-hydration`, async () => {
          return Promise.resolve();
        });
      });
    }
  }
}

// Hook to track user interactions
export function trackInteraction(interactionType: string, element: HTMLElement) {
  element.addEventListener('click', () => {
    performanceMonitor.measure(`interaction-${interactionType}`, async () => {
      return Promise.resolve();
    });
  });
}

// Hook to track resource loading
export function trackResourceLoad(resourceName: string, resourceUrl: string) {
  if (typeof window !== 'undefined') {
    performanceMonitor.measure(`resource-${resourceName}`, async () => {
      return new Promise((resolve) => {
        const resourceLoadStart = performance.now();
        
        // For images
        if (resourceUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
          const img = new Image();
          img.onload = () => {
            const resourceLoadEnd = performance.now();
            console.log(`Resource ${resourceName} loaded in ${resourceLoadEnd - resourceLoadStart}ms`);
            resolve(undefined);
          };
          img.onerror = () => {
            console.error(`Resource ${resourceName} failed to load`);
            resolve(undefined);
          };
          img.src = resourceUrl;
        } else {
          // For other resources, we'll just resolve immediately
          resolve(undefined);
        }
      });
    });
  }
}

// Hook to track API calls
export async function trackApiCall<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
  return performanceMonitor.measure(`api-${apiName}`, apiCall);
}

// Hook to track component rendering performance
export function trackComponentRender(componentName: string, renderFn: () => void) {
  performanceMonitor.measure(`component-${componentName}`, async () => {
    renderFn();
    return Promise.resolve();
  });
}

// Get performance metrics summary
export function getPerformanceMetrics() {
  return performanceMonitor.getMetrics();
}

// Function to send performance metrics to analytics
export function sendPerformanceMetrics() {
  if (typeof window !== 'undefined') {
    const metrics = performanceMonitor.getMetrics();
    
    // Send metrics to analytics endpoint (implementation would depend on your analytics provider)
    // For example, you could send to Google Analytics, etc.
    console.log('Performance metrics:', metrics);
    
    // Clear metrics after sending
    performanceMonitor.clearMetrics();
  }
}