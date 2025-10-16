<script lang="ts">
  let {
    class: className = "",
    ...props
  } = $props();
</script>

<div class={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
  <slot />
</div>
