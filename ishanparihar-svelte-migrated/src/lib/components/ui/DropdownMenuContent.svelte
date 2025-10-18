<script lang="ts">
  import { getContext } from 'svelte';

  let { 
    className = '',
    children
  } = $props<{
    className?: string;
    children?: any;
  }>();
  
  // Get context from parent
  const dropdown = getContext<{ 
    close: () => void; 
    internalOpen: boolean; 
    contentRef: HTMLElement 
  }>('dropdown');
</script>

{#if dropdown.internalOpen}
  <div 
    bind:this={dropdown.contentRef}
    class={`absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 ${className}`}
    role="menu"
    aria-orientation="vertical"
  >
    {@render children?.()}
  </div>
{/if}