<script lang="ts">
  import { Heart, MessageCircle, Eye } from 'lucide-svelte';

  let {
    likesCount,
    commentsCount,
    viewsCount = 0,
    className = "",
  } = $props();

  const gapClass = className.includes("gap-")
    ? className.split(" ").find((cls) => cls.startsWith("gap-")) || "gap-4"
    : "gap-4";

  const otherClasses = className.replace(/gap-\S+/g, "").trim();
</script>

<div class={`flex items-center ${gapClass} text-sm text-neutral-600 dark:text-neutral-400 ${otherClasses}`}>
  <div class="flex items-center gap-1">
    <Heart class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span class="font-medium">{likesCount}</span>
  </div>

  <div class="flex items-center gap-1">
    <MessageCircle class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span class="font-medium">{commentsCount}</span>
  </div>

  <div class="flex items-center gap-1">
    <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span class="font-medium">{viewsCount}</span>
  </div>
</div>
