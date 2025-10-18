<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Heart } from 'lucide-svelte';
  import { auth } from '$lib/stores/auth';
  import { createBrowserClient } from '@supabase/ssr';
  import { env } from '$env/dynamic/public';

  const supabase = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  export let slug: string;
  export let initialCount: number = 0;

  let count = writable(initialCount);
  let isLiking = writable(false);

  async function like() {
    if (!$auth.user) {
      // Handle unauthenticated user
      return;
    }

    isLiking.set(true);
    count.update(c => c + 1);

    const { data: post } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();

    if (post) {
      await supabase.rpc('increment_likes', { post_id: post.id });
    }

    setTimeout(() => isLiking.set(false), 300);
  }
</script>

<button
  class="flex items-center gap-2 px-3 py-2 rounded-none border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-black cursor-pointer"
  on:click={like}
  disabled={$isLiking}
>
  <div class="flex items-center select-none">
    <Heart class="w-5 h-5" />
  </div>
  <span class="font-medium text-neutral-900 dark:text-white min-w-[20px] text-center">
    {$count}
  </span>
</button>
