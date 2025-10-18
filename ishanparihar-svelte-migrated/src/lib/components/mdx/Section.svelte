<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<div class="ml-4 mt-2 mb-6">
  {@render children?.()}
</div>
