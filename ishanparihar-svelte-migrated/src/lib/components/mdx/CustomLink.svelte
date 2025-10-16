<script lang="ts">
  let {
    href,
    ...props
  } = $props();
</script>

{#if href?.startsWith("/")}
  <a {href} class="text-primary hover:underline" {...props}>
    <slot />
  </a>
{:else}
  <a {href} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" {...props}>
    <slot />
  </a>
{/if}