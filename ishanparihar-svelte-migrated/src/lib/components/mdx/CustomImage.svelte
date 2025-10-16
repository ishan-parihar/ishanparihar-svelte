<script lang="ts">
  let {
    src,
    alt,
    width,
    height,
    ...props
  } = $props();

  // TODO: Implement image optimization and URL fixing
</script>

<img {src} {alt} {width} {height} class="w-full h-auto my-8 cursor-pointer transition-opacity hover:opacity-90" {...props} />