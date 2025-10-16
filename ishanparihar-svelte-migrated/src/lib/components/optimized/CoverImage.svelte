<script lang="ts">
  let {
    src,
    alt,
    className = "w-full h-full object-cover",
    priority = false,
    width,
    height,
  } = $props();

  // TODO: Implement image optimization
</script>

<img {src} {alt} {width} {height} class={className} loading={priority ? 'eager' : 'lazy'} />
