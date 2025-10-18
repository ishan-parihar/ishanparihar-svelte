<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<td class="px-4 py-3">
  {@render children?.()}
</td>
