<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<details class="my-4 border border-border rounded-none">
  {@render children?.()}
</details>
