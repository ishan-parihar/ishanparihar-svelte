<script lang="ts">
  // TODO: Find a Svelte equivalent for next-mdx-remote
  let {
    source,
    className = "",
  } = $props();
</script>

<div class={`prose dark:prose-invert max-w-none mdx-clean-content prose-ul:list-disc prose-ol:list-decimal prose-li:list-item prose-li:my-1 ${className}`}>
  {@html source}
</div>
