  <script lang="ts">
  	import { cn } from "$lib/utils";
    import type { Snippet } from 'svelte';

  	let { 
      className = "", 
      children = $bindable() as () => Snippet,
      ...restProps 
    } = $props<{ className?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={cn("rounded-none border border-border bg-card text-card-foreground shadow-sm", className)} {...restProps}>
  	{@render children?.()}
  </div>