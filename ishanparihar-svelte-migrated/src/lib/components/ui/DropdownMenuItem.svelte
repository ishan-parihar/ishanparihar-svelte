  <script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { createEventDispatcher } from 'svelte';
    import type { Snippet } from 'svelte';

    let { 
      className = '', 
      disabled = false,
      children = $bindable() as () => Snippet
    } = $props<{
      className?: string;
      disabled?: boolean;
      children?: () => Snippet;
    }>();
    
    const dispatch = createEventDispatcher();
    
    function handleClick() {
      if (!disabled) {
        dispatch('click');
      }
    }
    
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          dispatch('click');
        }
      }
    }
  </script>

  <div 
    class={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    role="menuitem"
    tabindex="0"
  >
    {@render children?.()}
  </div>