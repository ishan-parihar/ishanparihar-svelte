<script lang="ts">
  import type { PageData } from './$types';
  import Card from '$lib/components/ui/Card.svelte';
  import { sessionStore } from '$lib/stores/session';

  export let data: PageData;

  const { posts } = data;

  const { state: sessionState } = sessionStore;
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Blog</h1>

  {#if sessionState.isLoggedIn}
    <p class="mb-8">Welcome, {sessionState.user?.name || 'user'}!</p>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each posts as post (post.id)}
      <Card
        id={post.id}
        title={post.title}
        excerpt={post.excerpt}
        coverImage={post.cover_image}
        date={post.date}
        category={post.category}
        slug={post.slug}
        premium={post.premium}
        likes_count={post.likes_count}
        comments_count={post.comments_count}
        views_count={post.views_count}
        content_type={post.content_type}
      />
    {/each}
  </div>
</div>
