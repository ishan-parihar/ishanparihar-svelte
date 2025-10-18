<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<summary class="p-3 font-medium cursor-pointer hover:bg-muted/50">
  {@render children?.()}
</summary>
