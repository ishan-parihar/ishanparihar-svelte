<script lang="ts">
  import { onMount } from 'svelte';
  import { performanceMonitor } from '$lib/performance/monitoring';

let {
  src,
  alt = '',
  width,
  height,
  fallback = 'Loading...',
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  children,
  onLoad,
  onError
} = $props<{
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fallback?: string;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  children?: () => any;
  onLoad?: () => void;
  onError?: (event: { error: Error }) => void;
}>();

  let element: HTMLElement | null = $state(null);
  let isLoaded = $state(false);
  let hasError = $state(false);
  let imgElement: HTMLImageElement | null = $state(null);

  

  onMount(() => {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the content when it comes into view
            loadContent();
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: threshold,
        rootMargin: rootMargin
      });

      if (element) {
        observer.observe(element);
      }

      // Cleanup function
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    } else {
      // If not in browser, load immediately
      loadContent();
    }
  });

  async function loadContent() {
    try {
      // Use performance monitor to measure loading time
      await performanceMonitor.measure('lazy-load-content', async () => {
        if (imgElement && src) {
          imgElement.src = src;
imgElement.onload = () => {
  isLoaded = true;
  onLoad?.();
};
imgElement.onerror = () => {
  hasError = true;
  onError?.({ error: new Error('Image failed to load') });
};
        } else {
// For non-image content, just mark as loaded after a short delay
await new Promise(resolve => setTimeout(resolve, 100));
isLoaded = true;
onLoad?.();
        }
      });
    } catch (error) {
hasError = true;
onError?.({ error });
    }
 }
</script>

{#if src}
  <div bind:this={element} class="lazy-load-container {className}">
    {#if isLoaded && !hasError}
      <img
        bind:this={imgElement}
        alt={alt}
        width={width}
        height={height}
        class="lazy-loaded-image"
      />
    {:else if hasError}
      <div class="error">Failed to load image</div>
    {:else}
      <div class="fallback">{fallback}</div>
    {/if}
  </div>
{:else}
  <div bind:this={element} class="lazy-load-container {className}">
    {#if isLoaded && !hasError}
      {@render children?.()}
    {:else if hasError}
      <div class="error">Failed to load content</div>
    {:else}
      <div class="fallback">{fallback}</div>
    {/if}
  </div>
{/if}

<style>
  .lazy-load-container {
    position: relative;
    min-height: 100px;
    min-width: 100px;
  }

  .lazy-loaded-image {
    width: 100%;
    height: auto;
  }

  .fallback,
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: #f3f4f6;
    color: #6b7280;
  }
</style>
