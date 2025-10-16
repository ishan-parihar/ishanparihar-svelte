<script lang="ts">
  let className = ''
  export { className as class }
</script>

<div class="animate-pulse rounded-md bg-muted {className}" {...$$restProps}>
  <slot />
</div>
