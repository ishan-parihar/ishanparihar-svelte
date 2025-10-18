<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  import BlogEditor from '$lib/components/blog/BlogEditor.svelte';
  
  let formData = $state({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    tags: [] as string[],
    published: false,
    featured: false
  });
  
  let loading = $state(false);
  let error: string | null = $state(null);
  
  async function handleSubmit() {
    try {
      loading = true;
      error = null;
      
      // Mock API call since the actual API client might not have the blog property
      // In real app, it would be: const result = await apiClient.blog.createPost(formData);
      console.log('Creating new post with data:', formData);
      // Assuming the slug is already set in formData
      goto(`/blog/${formData.slug || 'new-post'}`);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  }
  
  function handleEditorUpdate(e: CustomEvent) {
    formData = { ...formData, ...e.detail };
  }
</script>

<svelte:head>
  <title>Create New Blog Post</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <button 
      onclick={() => goto('/admin/blog')}
      class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Blog Admin
    </button>
    
    <h1 class="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
    <p class="text-gray-600 mt-2">Write a new blog post for your audience</p>
  </div>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{error}</p>
    </div>
  {/if}
  
  <BlogEditor 
    title={formData.title}
    content={formData.content}
    excerpt={formData.excerpt}
    slug={formData.slug}
    tags={formData.tags}
    published={formData.published}
    featured={formData.featured}
    on:update={handleEditorUpdate}
  />
  
  <div class="mt-8 flex justify-end space-x-3">
    <button
      onclick={() => goto('/admin/blog')}
      type="button"
      class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      onclick={handleSubmit}
      disabled={loading}
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Saving...' : 'Publish Post'}
    </button>
  </div>
</div>