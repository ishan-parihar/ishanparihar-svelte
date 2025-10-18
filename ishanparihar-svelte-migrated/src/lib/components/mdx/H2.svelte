  <script lang="ts">
    import type { Snippet } from 'svelte';
    let {
      id,
      children = $bindable() as () => Snippet
    } = $props<{ id?: string; children?: () => Snippet }>();
  </script>

  <h2 {id} class="text-2xl font-heading mt-8 mb-4 text-foreground relative group scroll-mt-[100px]">
    {@render children?.()}
    {#if id}
      <a href={`#${id}`} class="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Link to ${id}`}>
        #
      </a>
    {/if}
  </h2>