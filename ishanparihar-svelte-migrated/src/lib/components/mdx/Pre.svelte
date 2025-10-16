<script lang="ts">
  let {
    class: className = "",
    ...props
  } = $props();

  const language = className ? className.replace("language-", "") : "";
</script>

<div class="relative group">
  {#if language}
    <div class="absolute right-4 top-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded font-mono">
      {language}
    </div>
  {/if}
  <pre class={`bg-muted p-4 pt-10 rounded-none overflow-x-auto my-6 text-sm font-mono ${className}`}>
    <slot />
  </pre>
</div>