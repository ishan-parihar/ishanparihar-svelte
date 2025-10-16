<script lang="ts">
  let {
    id,
  } = $props();
</script>

<h3 {id} class="text-xl font-heading mt-6 mb-3 text-foreground relative group scroll-mt-[100px]">
  <slot />
  {#if id}
    <a href={`#${id}`} class="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Link to ${id}`}>
      #
    </a>
  {/if}
</h3>