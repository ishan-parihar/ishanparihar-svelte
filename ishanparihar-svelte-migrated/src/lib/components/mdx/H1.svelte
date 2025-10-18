  <script lang="ts">
    import type { Snippet } from 'svelte';
    let {
      id,
      children = $bindable() as () => Snippet
    } = $props<{ id?: string; children?: () => Snippet }>();
  </script>

  <h1 {id} class="text-3xl font-heading mt-10 mb-6 text-foreground relative group scroll-mt-[100px]">
    {@render children?.()}
    {#if id}
      <a href={`#${id}`} class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Link to ${id}`}>
        #
      </a>
    {/if}
  </h1>