<script lang="ts">
  import { Heart, MessageCircle, Eye } from 'lucide-svelte';
  import { user } from '$lib/stores/user';

  let {
    slug,
    initialLikesCount = 0,
    initialCommentsCount = 0,
    initialViewsCount = 0,
    showLiking = true,
    onCommentsClick,
    className = "",
    onEngagementUpdate,
  } = $props();

  let likesCount = $state(initialLikesCount);
  let commentsCount = $state(initialCommentsCount);
  let viewsCount = $state(initialViewsCount);

  function handleLike() {
    // TODO: Implement like logic
    likesCount++;
  }

  function handleCommentsClick() {
    if (onCommentsClick) {
      onCommentsClick();
    } else {
      const commentsSection = document.querySelector(".comments-section");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
</script>

<div class={`flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
  {#if showLiking}
    <button
      on:click={handleLike}
      class={`flex items-center gap-1 transition-colors duration-200 disabled:opacity-50 ${$user ? 'hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer' : 'hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer'}`}
    >
      <Heart class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span class="font-medium">{likesCount}</span>
      {#if !$user}
        <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-1">(Sign in)</span>
      {/if}
    </button>
  {/if}

  <button
    on:click={handleCommentsClick}
    class="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
    title="View comments"
  >
    <MessageCircle class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span class="font-medium">{commentsCount}</span>
  </button>

  <div class="flex items-center gap-1" title="Views">
    <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span class="font-medium">{viewsCount}</span>
  </div>
</div>
