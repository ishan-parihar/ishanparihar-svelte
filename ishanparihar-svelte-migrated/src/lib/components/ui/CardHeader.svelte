  <script lang="ts">
  	import { cn } from "$lib/utils";
    import type { Snippet } from 'svelte';

  	let { 
      className = "", 
      children = $bindable() as () => Snippet,
      ...restProps 
    } = $props<{ className?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={cn("flex flex-col space-y-1.5 p-6", className)} {...restProps}>
  	{@render children?.()}
  </div>