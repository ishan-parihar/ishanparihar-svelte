<script lang="ts">
  import { onMount } from 'svelte';
  import CommentForm from './CommentForm.svelte';
  import CommentItem from './CommentItem.svelte';
  import { Loader2, MessageSquare } from 'lucide-svelte';

  let {
    blogPostId,
    blogPostSlug,
    initialComments = [],
  } = $props();

  let comments = $state(initialComments);
  let isLoading = $state(!initialComments.length);
  let error = $state(null);

  onMount(async () => {
    if (!initialComments.length) {
      // TODO: Fetch comments
      await new Promise(resolve => setTimeout(resolve, 1000));
      isLoading = false;
    }
  });

  function handleCommentAdded() {
    // TODO: Refetch comments
  }
  
  let onCommentAdded = handleCommentAdded;
</script>

<section class="mt-8 pt-8 border-t border-border/40 max-w-3xl mx-auto min-h-0">
  <div class="comment-form-container mb-4">
    <CommentForm {blogPostId} {onCommentAdded} onCancel={() => {}} />
  </div>

  {#if isLoading}
    <div class="flex justify-center items-center py-8">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  {:else if error}
    <div class="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-800/50">
      {error}
    </div>
  {:else if comments.length > 0}
    <div class="space-y-3 mt-2">
      {#each comments as comment}
        <CommentItem {comment} {blogPostId} {onCommentAdded} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-6 border border-dashed border-border/50 rounded-md">
      <MessageSquare class="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
      <h3 class="text-base font-medium">No comments yet</h3>
      <p class="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-0">
        Be the first to share your thoughts on this post!
      </p>
    </div>
  {/if}
</section>
