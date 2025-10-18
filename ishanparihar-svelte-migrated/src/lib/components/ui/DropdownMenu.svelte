<script lang="ts">
  import { getContext, setContext } from 'svelte';

  let { 
    open = false, 
    onOpenChange, 
    className = '',
    children
  } = $props<{
    open?: boolean;
    onOpenChange?: ((open: boolean) => void);
    className?: string;
    children?: any;
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
    close,
    triggerRef,
    contentRef
  });
</script>

<div class={`relative inline-block text-left ${className}`}>
  {@render children?.()}
</div>
