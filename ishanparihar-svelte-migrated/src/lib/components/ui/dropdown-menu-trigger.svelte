<script lang="ts">
  import { getContext } from 'svelte';
  let { 
    className = '',
    open = $bindable(),
    children,
    ...props 
  } = $props<{ className?: string; open?: boolean; children?: () => any; [key: string]: any }>();

  // Get context from parent dropdown menu
  const dropdownContext = getContext('dropdown') as { 
    internalOpen: boolean; 
    toggle: () => void 
  } | undefined;
  
  let isOpen = $derived(dropdownContext ? dropdownContext.internalOpen : open);
  
  function handleClick() {
    if (dropdownContext) {
      dropdownContext.toggle();
    } else {
      // Fallback for standalone usage
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape') {
      if (dropdownContext) {
        // Close menu - this should come from context
      }
    }
  }
</script>

<button
  class={`flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:hover:bg-gray-800 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 ${className}`}
  type="button"
  aria-haspopup="true"
  aria-expanded={isOpen}
  onclick={handleClick}
  onkeydown={handleKeydown}
  {...props}
>
  {@render children?.()}
</button>