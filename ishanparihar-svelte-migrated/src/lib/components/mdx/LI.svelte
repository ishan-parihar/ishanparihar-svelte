<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<li class="mb-2 !list-item">
  {@render children?.()}
</li>