<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<thead class="bg-muted text-foreground">
  {@render children?.()}
</thead>
