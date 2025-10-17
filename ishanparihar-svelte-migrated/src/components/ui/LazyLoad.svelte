<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { performanceMonitor } from '$lib/performance/monitoring';

  export let src: string;
  export let alt: string = '';
  export let width: number | undefined;
  export let height: number | undefined;
  export let fallback: string = 'Loading...';
  export let threshold: number = 0.1;
  export let rootMargin: string = '50px';
  export let className: string = '';

  let element: HTMLElement | null = null;
  let isLoaded = $state(false);
  let hasError = $state(false);
  let imgElement: HTMLImageElement | null = null;

  const dispatch = createEventDispatcher();

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
            dispatch('load');
          };
          imgElement.onerror = () => {
            hasError = true;
            dispatch('error', { error: new Error('Image failed to load') });
          };
        } else {
          // For non-image content, just mark as loaded after a short delay
          await new Promise(resolve => setTimeout(resolve, 100));
          isLoaded = true;
          dispatch('load');
        }
      });
    } catch (error) {
      hasError = true;
      dispatch('error', { error });
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
      <slot />
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
