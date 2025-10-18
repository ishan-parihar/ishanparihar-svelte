<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  let categories = $state<any[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  
  onMount(async () => {
    try {
      // In a real app, this would be apiClient.blog.getCategories()
      // For now, using mock data
      categories = [
        { 
          id: 1, 
          name: "Development", 
          slug: "development", 
          description: "Articles about web development, programming, and software engineering",
          post_count: 15,
          created_at: "2023-01-15"
        },
        { 
          id: 2, 
          name: "JavaScript", 
          slug: "javascript", 
          description: "All things JavaScript, frameworks, libraries, and best practices",
          post_count: 12,
          created_at: "2023-02-20"
        },
        { 
          id: 3, 
          name: "Svelte", 
          slug: "svelte", 
          description: "Svelte framework, SvelteKit, and component development",
          post_count: 8,
          created_at: "2023-03-10"
        },
        { 
          id: 4, 
          name: "Web Design", 
          slug: "web-design", 
          description: "UI/UX, design principles, and modern web design trends",
          post_count: 6,
          created_at: "2023-04-05"
        },
        { 
          id: 5, 
          name: "Performance", 
          slug: "performance", 
          description: "Optimization techniques and performance best practices",
          post_count: 5,
          created_at: "2023-05-12"
        }
      ];
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Blog Categories</title>
  <meta name="description" content="Browse blog posts by category" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Blog Categories</h1>
    <p class="text-gray-600 mt-2">Explore articles by topic</p>
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
    {#if categories.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each categories as category (category.id)}
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  <a 
                    href={`/blog/category/${category.slug}`}
                    class="hover:text-blue-600 transition-colors"
                  >
                    {category.name}
                  </a>
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                  {category.description}
                </p>
              </div>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {category.post_count} posts
              </span>
            </div>
            <div class="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Created {new Date(category.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500">No categories found.</p>
      </div>
    {/if}
  {/if}
</div>