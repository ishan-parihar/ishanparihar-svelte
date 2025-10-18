<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  let authorData = $state<any>(null);
  let posts = $state<any[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  
  onMount(async () => {
    try {
      // Extract author from the URL
      const url = new URL($page.url);
      const author = url.pathname.split('/')[3]; // Get author from /blog/author/[author]
      
      // In a real app, this would be apiClient.blog.getAuthor(author)
      // For now, using mock data
      authorData = {
        id: 1,
        name: author,
        bio: `Articles and insights by ${author}.`,
        avatar: '/default-blog-image.jpg',
        post_count: 5,
        join_date: '2023-01-15'
      };
      
      // In a real app, this would be apiClient.blog.getPostsByAuthor(author)
      // For now, using mock data
      posts = [
        {
          id: 1,
          title: "Getting Started with Svelte 5",
          slug: "getting-started-with-svelte-5",
          excerpt: "Learn the basics of Svelte 5 and its new rune system.",
          featured_image: "/default-blog-image.jpg",
          created_at: "2023-05-15T10:00:00Z",
          read_time: "5 min read",
          category: "Development"
        },
        {
          id: 2,
          title: "Building Modern Web Applications",
          slug: "building-modern-web-applications",
          excerpt: "Best practices for creating performant web applications.",
          featured_image: "/default-blog-image.jpg",
          created_at: "2023-06-20T14:30:00Z",
          read_time: "8 min read",
          category: "Web Design"
        },
        {
          id: 3,
          title: "Advanced State Management",
          slug: "advanced-state-management",
          excerpt: "Deep dive into state management patterns for complex applications.",
          featured_image: "/default-blog-image.jpg",
          created_at: "2023-07-10T09:15:00",
          read_time: "10 min read",
          category: "Development"
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
  <title>Articles by {authorData?.name || 'Author'}</title>
  <meta name="description" content={`Articles and insights by ${authorData?.name || 'this author'}`} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{error}</p>
    </div>
  {:else if authorData}
    <!-- Author Header -->
    <div class="mb-12 text-center">
      <div class="flex justify-center mb-4">
        <img
          src={authorData.avatar}
          alt={authorData.name}
          class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>
      <h1 class="text-3xl font-bold text-gray-900">{authorData.name}</h1>
      <p class="text-gray-600 mt-2">{authorData.bio}</p>
      <div class="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
        <span>{authorData.post_count} articles</span>
        <span>Joined {new Date(authorData.join_date).toLocaleDateString()}</span>
      </div>
    </div>
    
    <!-- Author Posts -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Articles by {authorData.name}</h2>
      
      {#if posts.length > 0}
        <div class="space-y-8">
          {#each posts as post (post.id)}
            <article class="border-b border-gray-200 dark:border-gray-700 pb-8">
              <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-1/3">
                  <a href={`/blog/${post.slug}`}>
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      class="w-full h-48 object-cover rounded-lg"
                    />
                  </a>
                </div>
                <div class="md:w-2/3">
                  <div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post.read_time}</span>
                    <span>•</span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">
                    <a href={`/blog/${post.slug}`} class="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h3>
                  <p class="text-gray-600 mb-3">{post.excerpt}</p>
                  <a 
                    href={`/blog/${post.slug}`}
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read more
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-500">No articles found by this author.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>