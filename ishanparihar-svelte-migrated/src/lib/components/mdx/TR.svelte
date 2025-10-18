<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<tr class="border-b border-border">
  {@render children?.()}
</tr>
