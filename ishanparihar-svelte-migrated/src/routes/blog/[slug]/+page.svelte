<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { createBrowserClient } from '@supabase/ssr';
  import { env } from '$env/dynamic/public';
  import type { Database } from '$lib/types/database';
  import { writable } from 'svelte/store';
  
  type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
  import MdxRenderer from '$lib/components/mdx/MdxRenderer.svelte';
  import NativeTTSPlayer from '$lib/components/tts/NativeTTSPlayer.svelte';
  import { extractPlainTextFromMDX } from '$lib/utils';

  const supabase = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  let post = writable<BlogPost | null>(null);
  let plainTextContent = writable('');

  onMount(async () => {
    const { slug } = $page.params;
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    if (data) {
      post.set(data as BlogPost);
      plainTextContent.set(extractPlainTextFromMDX(data.content));
    }
  });
</script>

<div class="container mx-auto px-4 py-8">
  {#if $post}
    <h1 class="text-3xl font-bold mb-4">{$post.title}</h1>
    <div class="mb-8">
      <NativeTTSPlayer textToSpeak={$plainTextContent} />
    </div>
    <div class="prose dark:prose-invert max-w-none">
      <MdxRenderer source={$post.content} />
    </div>
  {:else}
    <p>Loading...</p>
  {/if}
</div>
