<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<p class="mb-6 text-foreground leading-relaxed font-ui">
  {@render children?.()}
</p>