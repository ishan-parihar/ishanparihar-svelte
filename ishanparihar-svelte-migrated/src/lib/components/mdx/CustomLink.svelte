  <script lang="ts">
    import type { Snippet } from 'svelte';
    let {
      href,
      children = $bindable() as () => Snippet,
      ...props
    } = $props<{ href?: string; children?: () => Snippet; [key: string]: any }>();
  </script>

  {#if href?.startsWith("/")}
    <a {href} class="text-primary hover:underline" {...props}>
      {@render children?.()}
    </a>
  {:else}
    <a {href} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" {...props}>
      {@render children?.()}
    </a>
  {/if}