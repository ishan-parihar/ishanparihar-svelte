<script lang="ts">
  let { children } = $props<{ children?: any; }>();
</script>

<div class="overflow-x-auto my-6">
  <table class="w-full border-collapse">
    {@render children?.()}
  </table>
</div>
