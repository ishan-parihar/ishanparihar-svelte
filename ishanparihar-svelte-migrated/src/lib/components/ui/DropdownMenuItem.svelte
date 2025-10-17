<script lang="ts">
  let {
    children,
    asChild = false,
    class: className = '',
  } = $props();
</script>

{#if asChild}
  {@render children?.()}
{:else}
  <div role="menuitem" class={className}>
    {@render children?.()}
  </div>
{/if}
