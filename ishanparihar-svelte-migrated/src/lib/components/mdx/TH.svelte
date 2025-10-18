<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<th class="px-4 py-3 text-left font-medium">
  {@render children?.()}
</th>
