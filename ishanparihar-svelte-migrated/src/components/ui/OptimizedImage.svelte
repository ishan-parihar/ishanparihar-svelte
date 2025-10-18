<script lang="ts">
  import { onMount } from 'svelte';
  import { getOptimizedImageUrl } from '$lib/performance/image-optimization';
  
  export let src: string;
  export let alt: string;
  export let width: number | undefined;
  export let height: number | undefined;
  export let loading: 'lazy' | 'eager' = 'lazy';
  export let classStr: string = '';
  
  let imgElement: HTMLImageElement;
  let isLoaded = false;
  let isError = false;
  let optimizedSrc = '';
  
  onMount(async () => {
    try {
      optimizedSrc = await getOptimizedImageUrl(src, {
        width,
        height,
        quality: 80,
        format: 'webp'
      });
    } catch (error) {
      console.error('Failed to optimize image:', error);
      optimizedSrc = src;
    }
  });
  
  function handleLoad() {
    isLoaded = true;
  }
  
  function handleError() {
    isError = true;
 }
</script>

<div class="relative {classStr}">
  <img
    bind:this={imgElement}
    src={optimizedSrc}
    alt={alt}
    {width}
    {height}
    {loading}
    class="w-full h-full object-cover transition-opacity duration-300 {isLoaded ? 'opacity-100' : 'opacity-0'}"
    on:load={handleLoad}
    on:error={handleError}
  />
  
  {#if !isLoaded && !isError}
    <div class="absolute inset-0 bg-gray-20 dark:bg-gray-700 animate-pulse"></div>
  {/if}
  
  {#if isError}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  {/if}
</div>