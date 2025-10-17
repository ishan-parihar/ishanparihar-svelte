<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import BlogPostsTable from '$lib/components/admin/BlogPostsTable.svelte';
  import BlogFilters from '$lib/components/admin/BlogFilters.svelte';
  import { apiClient } from '$lib/api/client';
  
  let posts: any[] = [];
  let loading = true;
  let filters = {
    status: 'all',
    category: 'all',
    search: ''
  };
  
  onMount(async () => {
    await loadPosts();
  });
  
  async function loadPosts() {
    try {
      loading = true;
      posts = await apiClient.admin.blog.getPosts(filters);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      loading = false;
    }
  }
  
  function handleCreatePost() {
    goto('/admin/blog/new');
  }
  
  function handleEditPost(slug: string) {
    goto(`/admin/blog/edit/${slug}`);
  }
  
  async function handleDeletePost(slug: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await apiClient.admin.blog.deletePost(slug);
        await loadPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Blog Management
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Create and manage your blog content
      </p>
    </div>
    
    <button 
      on:click={handleCreatePost}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Create New Post
    </button>
  </div>
  
  <!-- Filters -->
  <BlogFilters 
    {filters}
    on:change={(e) => {
      filters = { ...filters, ...e.detail };
      loadPosts();
    }}
  />
  
  <!-- Posts Table -->
  <BlogPostsTable 
    {posts}
    {loading}
    on:edit={(e) => handleEditPost(e.detail)}
    on:delete={(e) => handleDeletePost(e.detail)}
  />
</div>