  <script lang="ts">
  	import { cn } from "$lib/utils";
    import type { Snippet } from 'svelte';

  	let { 
      className = "", 
      children = $bindable() as () => Snippet,
      ...restProps 
    } = $props<{ className?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={cn("flex items-center p-6 pt-0", className)} {...restProps}>
  	{@render children?.()}
  </div>