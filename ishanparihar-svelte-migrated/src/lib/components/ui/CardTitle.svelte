  <script lang="ts">
  	import { cn } from "$lib/utils";
    import type { Snippet } from 'svelte';

  	let { 
      className = "", 
      children = $bindable() as () => Snippet,
      ...restProps 
    } = $props<{ className?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={cn("text-xl font-ui font-semibold leading-none tracking-tight text-foreground", className)} {...restProps}>
  	{@render children?.()}
  </div>