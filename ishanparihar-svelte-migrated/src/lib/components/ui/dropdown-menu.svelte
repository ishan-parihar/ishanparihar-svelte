<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  let { 
    open = false, 
    onOpenChange, 
    className = '',
    trigger,
    children
  } = $props<{
    open?: boolean;
    onOpenChange?: ((open: boolean) => void);
    className?: string;
    trigger?: (internalOpen: boolean, toggle: () => void) => any;
    children?: (close: () => void) => any;
  }>();
  
  // Create reactive state for open
  let internalOpen = $state(open);
  
  // Sync prop changes to state
  $effect(() => {
    internalOpen = open;
  });
  
let triggerRef = $state<HTMLElement>();
let contentRef = $state<HTMLElement>();
  
  function toggle() {
    internalOpen = !internalOpen;
    onOpenChange?.(internalOpen);
  }
  
  function close() {
    internalOpen = false;
    onOpenChange?.(false);
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
  
  // Handle clicks outside to close the dropdown
  const handleClickOutside = (e: Event) => {
    if (internalOpen && 
        triggerRef && 
        contentRef && 
        !triggerRef.contains(e.target as Node) && 
        !contentRef.contains(e.target as Node)) {
      close();
    }
  };
  
  $effect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  // Set up context for child components
  setContext('dropdown', {
    get internalOpen() {
      return internalOpen;
    },
    toggle,
    close
  });
</script>

<div class={`relative inline-block text-left ${className}`}>
  <div bind:this={triggerRef}>
    {@render trigger?.(internalOpen, toggle)}
  </div>
  
  {#if internalOpen}
    <div 
      bind:this={contentRef}
      class="absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
      role="menu"
      aria-orientation="vertical"
    >
      {@render children?.(close)}
    </div>
  {/if}
</div>