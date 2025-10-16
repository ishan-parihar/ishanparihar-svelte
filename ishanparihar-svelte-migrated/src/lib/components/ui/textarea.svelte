<script lang="ts">
  let {
    class: className = "",
    ...props
  } = $props();
</script>

<textarea
  class={`min-h-[80px] resize-y transition-all duration-200 text-sm border border-gray-300 dark:border-gray-700 focus-visible:ring-primary-600 focus-visible:ring-1 focus-visible:border-primary-600 ${className}`}
  {...props}
/>
