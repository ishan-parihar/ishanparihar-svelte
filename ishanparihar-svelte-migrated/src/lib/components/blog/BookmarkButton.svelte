<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { Bookmark, Loader2 } from 'lucide-svelte';
  import { auth } from '$lib/stores/auth';
  import { createBrowserClient } from '@supabase/ssr';
  import { env } from '$env/dynamic/public';

  const supabase = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
  const dispatch = createEventDispatcher();

  export let postId: string;
  export let showLabel = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  let isBookmarked = writable(false);
  let isLoading = writable(false);

  onMount(async () => {
    if ($auth.user) {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', $auth.user.id)
        .single();
      if (data) {
        isBookmarked.set(true);
      }
    }
  });

  async function toggleBookmark() {
    if (!$auth.user) {
      // Handle unauthenticated user
      return;
    }

    isLoading.set(true);

    if ($isBookmarked) {
      await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: $auth.user.id });
      isBookmarked.set(false);
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: $auth.user.id });
      isBookmarked.set(true);
    }

    isLoading.set(false);
  }

  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'p-1.5',
      text: 'text-xs',
    },
    md: {
      icon: 'w-5 h-5',
      button: 'p-2',
      text: 'text-sm',
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'p-3',
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];
</script>

<button
  class="flex items-center gap-1 {config.button} rounded-none border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed {$isBookmarked ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200' : 'bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'} {$isLoading ? 'cursor-wait' : 'cursor-pointer'}"
  on:click={toggleBookmark}
  disabled={$isLoading}
>
  {#if $isLoading}
    <Loader2 class="{config.icon} animate-spin" />
  {:else if $isBookmarked}
    <Bookmark class="{config.icon} fill-current" />
  {:else}
    <Bookmark class="{config.icon}" />
  {/if}

  {#if showLabel}
    <span class="font-medium {config.text}">
      {$isLoading ? '...' : $isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </span>
  {/if}
</button>