  <script lang="ts">
  	import { cn } from "$lib/utils";
    import type { Snippet } from 'svelte';

  	let { 
      className = "", 
      children = $bindable() as () => Snippet,
      ...restProps 
    } = $props<{ className?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={cn("text-sm text-neutral-500 dark:text-neutral-400 font-ui", className)} {...restProps}>
  	{@render children?.()}
  </div>