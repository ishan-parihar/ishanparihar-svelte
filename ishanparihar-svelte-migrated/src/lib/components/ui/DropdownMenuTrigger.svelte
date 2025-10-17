<script lang="ts">
  let {
    children,
    asChild = false,
  } = $props();
</script>

{#if asChild}
  {@render children?.()}
{:else}
  <div>
    {@render children?.()}
  </div>
{/if}
