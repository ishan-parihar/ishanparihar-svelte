  <script lang="ts">
    import type { Snippet } from 'svelte';
    type CalloutType = 'info' | 'warning' | 'error' | 'success';

    let {
      type = "info",
      children = $bindable() as () => Snippet,
    } = $props<{ type?: CalloutType; children?: () => Snippet }>();

    const typeStyles: Record<CalloutType, string> = {
      info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
      warning:
        "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
      error:
        "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      success:
        "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    };

    const icons: Record<CalloutType, string> = {
      info: "💡",
      warning: "⚠️",
      error: "🚫",
      success: "✅",
    };

    // Ensure type is valid to prevent TypeScript error
    const validType = type in typeStyles ? type : 'info';
  </script>

  <div class={`p-4 my-6 border-l-4 rounded-r-lg ${typeStyles[type as CalloutType] || typeStyles.info}`}>
    <div class="flex items-start">
      <span class="mr-2 text-lg">{icons[type as CalloutType] || icons.info}</span>
      <div>
        {@render children?.()}
      </div>
    </div>
  </div>
