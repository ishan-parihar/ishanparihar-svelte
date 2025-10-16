<script lang="ts">
  let {
    class: className = "",
    ...props
  } = $props();
</script>

<div class={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
  <slot />
</div>
