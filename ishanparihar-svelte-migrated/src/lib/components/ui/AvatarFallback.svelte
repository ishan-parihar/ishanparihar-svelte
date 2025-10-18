  <script lang="ts">
    import type { Snippet } from 'svelte';
    let {
      class: className = "",
      children = $bindable() as () => Snippet,
      ...props
    } = $props<{ class?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  <div class={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {@render children?.()}
  </div>
