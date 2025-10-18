  <script lang="ts">
    import type { Snippet } from 'svelte';
    let {
      class: className = "",
      children = $bindable() as () => Snippet,
      ...props
    } = $props<{ class?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {@render children?.()}
  </div>
