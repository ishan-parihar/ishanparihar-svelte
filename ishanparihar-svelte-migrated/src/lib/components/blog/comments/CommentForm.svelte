<script lang="ts">
  import { user } from '$lib/stores/user';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/button.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Avatar from '$lib/components/ui/avatar.svelte';
  import AvatarImage from '$lib/components/ui/AvatarImage.svelte';
  import AvatarFallback from '$lib/components/ui/AvatarFallback.svelte';
  import { Loader2, AlertCircle, KeyboardIcon } from 'lucide-svelte';

  let {
    blogPostId,
    parentId = null,
    onCommentAdded,
    onCancel,
    isReply = false,
  } = $props();

  let content = $state("");
  let error = $state(null);

  // TODO: Implement actual authentication logic
  const { isLoading: authLoading } = $auth;

  function handleSubmit() {
    // TODO: Implement comment submission
  }
</script>

{#if authLoading}
  <div class="flex justify-center items-center p-4">
    <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
  </div>
{:else if !$user}
  <div class="rounded-md bg-muted/50 p-4 text-center border border-border/50">
    <p class="text-sm text-muted-foreground mb-3">
      Please sign in to join the conversation
    </p>
    <Button variant="default" size="sm" on:click={() => { /* TODO: open auth modal */ }}>
      Sign In
    </Button>
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit} class="space-y-3 comment-form">
    <div class="flex items-start gap-2">
      <div class="flex-shrink-0 mt-1">
        <Avatar class="h-6 w-6">
          <AvatarImage src={$user.picture} alt={$user.name} />
          <AvatarFallback class="text-xs">
            {$user.name ? $user.name.charAt(0).toUpperCase() : $user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div class="flex-grow relative">
        <div class="relative w-full">
          <Textarea
            placeholder={isReply ? "Write a reply..." : "What are your thoughts?"}
            bind:value={content}
            class={`min-h-[80px] resize-y transition-all duration-200 text-sm border border-gray-300 dark:border-gray-700 focus-visible:ring-primary-600 focus-visible:ring-1 focus-visible:border-primary-600 ${isReply ? "min-h-[60px]" : ""}`}
          />
          <div class="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 flex items-center pointer-events-none">
            <KeyboardIcon class="h-3 w-3 mr-1" />
            <span>Ctrl+Enter to submit</span>
          </div>
        </div>
        {#if error}
          <p class="text-xs text-red-500 mt-1 flex items-center error-message">
            <AlertCircle class="h-3 w-3 mr-1" />
            {error}
          </p>
        {/if}
      </div>
    </div>

    <div class="flex justify-end gap-2">
      {#if isReply && onCancel}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          on:click={onCancel}
          class="h-8 text-xs font-medium"
        >
          Cancel
        </Button>
      {/if}

      <Button
        type="submit"
        variant="default"
        size="sm"
        disabled={!content.trim()}
        class="h-8 text-xs font-medium"
      >
        {#if isReply}
          Reply
        {:else}
          Post
        {/if}
      </Button>
    </div>
  </form>
{/if}
