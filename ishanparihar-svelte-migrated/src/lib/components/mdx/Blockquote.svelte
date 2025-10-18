<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<blockquote class="border-l-4 border-primary pl-4 italic my-6 text-foreground">
  {@render children?.()}
</blockquote>