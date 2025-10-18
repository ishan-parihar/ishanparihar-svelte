<script lang="ts">
  import { getContext } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  let { 
    className = '', 
    disabled = false,
    children
  } = $props<{
    className?: string;
    disabled?: boolean;
    children?: any;
  }>();
  
  // Get context from parent
  const dropdown = getContext<{ 
    toggle: () => void; 
    internalOpen: boolean; 
    triggerRef: HTMLElement;
  }>('dropdown');
  
  export function handleClick() {
    if (!disabled) {
      dropdown.toggle();
    }
  }
</script>

<button 
  bind:this={dropdown.triggerRef}
  class={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  onclick={handleClick}
  disabled={disabled}
  aria-haspopup="true"
  aria-expanded={dropdown.internalOpen}
 >
  {@render children?.()}
</button>