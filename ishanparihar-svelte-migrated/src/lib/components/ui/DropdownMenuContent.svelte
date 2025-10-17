<script lang="ts">
  let {
    children,
    class: className = '',
  } = $props();
</script>

<div class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 {className}">
  <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
    {@render children?.()}
  </div>
</div>
