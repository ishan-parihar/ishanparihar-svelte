<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<code class="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono">
  {@render children?.()}
</code>