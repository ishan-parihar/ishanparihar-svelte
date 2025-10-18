<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<ol class="mb-6 list-decimal pl-8 text-foreground !list-outside">
  {@render children?.()}
</ol>