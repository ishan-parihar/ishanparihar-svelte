<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<ul class="mb-6 list-disc pl-8 text-foreground !list-outside">
  {@render children?.()}
</ul>