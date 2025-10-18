<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<strong class="font-bold">
  {@render children?.()}
</strong>