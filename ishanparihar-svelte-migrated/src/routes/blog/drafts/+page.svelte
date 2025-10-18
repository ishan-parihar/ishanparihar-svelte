<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  
  let drafts = $state<any[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  
  onMount(async () => {
    try {
      // In a real app, this would be apiClient.blog.getDrafts()
      // For now, using mock data
      drafts = [
        {
          id: 1,
          title: "Understanding Svelte 5 Runes",
          slug: "understanding-svelte-5-runes",
          excerpt: "A comprehensive guide to using runes in Svelte 5.",
          created_at: "2023-07-25T11:00:00Z",
          updated_at: "2023-07-26T14:30:00Z"
        },
        {
          id: 2,
          title: "Building Accessible Web Components",
          slug: "building-accessible-web-components",
          excerpt: "Best practices for creating inclusive web experiences.",
          created_at: "2023-07-22T09:15:00Z",
          updated_at: "2023-07-23T16:45:00Z"
        },
        {
          id: 3,
          title: "Optimizing Performance in SvelteKit",
          slug: "optimizing-performance-in-sveltekit",
          excerpt: "Techniques for making SvelteKit applications faster.",
          created_at: "2023-07-18T14:20:00Z",
          updated_at: "2023-07-20T11:10:00Z"
        }
      ];
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
  
  async function handleEditDraft(draftId: number) {
    // In a real app, this would navigate to the edit page
    goto(`/blog/edit/${drafts.find(d => d.id === draftId)?.slug}`);
  }
  
  async function handleDeleteDraft(draftId: number) {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        // In a real app, this would call apiClient.blog.deletePost(draftId)
        // For now, just update the local state
        drafts = drafts.filter(d => d.id !== draftId);
      } catch (err) {
        error = (err as Error).message;
      }
    }
  }
</script>

<svelte:head>
  <title>Draft Posts</title>
  <meta name="description" content="Manage your unpublished blog drafts" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Draft Posts</h1>
    <p class="text-gray-600 mt-2">Manage your unpublished blog posts</p>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{error}</p>
    </div>
  {:else}
    {#if drafts.length > 0}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          {#each drafts as draft (draft.id)}
            <li class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {draft.title}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {draft.excerpt}
                  </p>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Created {new Date(draft.created_at).toLocaleDateString()}</span>
                    <span class="mx-2">•</span>
                    <span>Updated {new Date(draft.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button
                    onclick={() => handleEditDraft(draft.id)}
                    class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => handleDeleteDraft(draft.id)}
                    class="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500 mb-4">You don't have any draft posts.</p>
        <button
          onclick={() => goto('/blog/new')}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Post
        </button>
      </div>
    {/if}
  {/if}
</div>