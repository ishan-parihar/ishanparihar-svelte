<script lang="ts">
  let {
    src,
    alt,
    class: className = "",
    ...props
  } = $props();
</script>

<img {src} {alt} class={`aspect-square h-full w-full ${className}`} {...props} />
