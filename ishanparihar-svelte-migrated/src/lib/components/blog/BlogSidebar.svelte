<script lang="ts">
  import { onMount } from 'svelte';
  
  let featuredPosts = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let recentPosts = $state<any[]>([]);
  let loading = $state(true);
  
  onMount(async () => {
    // Simulating data loading - in a real app, this would fetch from an API
    // For now, we'll use mock data
    featuredPosts = [
      {
        id: 1,
        title: "Getting Started with Svelte 5",
        slug: "getting-started-with-svelte-5",
        featured_image: "/default-blog-image.jpg",
        created_at: "2023-05-15T10:00:00Z"
      },
      {
        id: 2,
        title: "Building Modern Web Applications",
        slug: "building-modern-web-applications",
        featured_image: "/default-blog-image.jpg",
        created_at: "2023-06-20T14:30:00Z"
      },
      {
        id: 3,
        title: "Advanced State Management",
        slug: "advanced-state-management",
        featured_image: "/default-blog-image.jpg",
        created_at: "2023-07-10T09:15:00Z"
      }
    ];
    
    categories = [
      { id: 1, name: "Development", slug: "development", post_count: 15 },
      { id: 2, name: "JavaScript", slug: "javascript", post_count: 12 },
      { id: 3, name: "Svelte", slug: "svelte", post_count: 8 },
      { id: 4, name: "Web Design", slug: "web-design", post_count: 6 },
      { id: 5, name: "Performance", slug: "performance", post_count: 5 }
    ];
    
    recentPosts = [
      {
        id: 4,
        title: "Understanding Svelte 5 Runes",
        slug: "understanding-svelte-5-runes",
        created_at: "2023-07-25T11:00:00Z"
      },
      {
        id: 5,
        title: "Optimizing Web Performance",
        slug: "optimizing-web-performance",
        created_at: "2023-07-22T16:45:00Z"
      },
      {
        id: 6,
        title: "CSS Framework Comparison",
        slug: "css-framework-comparison",
        created_at: "2023-07-18T13:20:00Z"
      },
      {
        id: 7,
        title: "API Design Best Practices",
        slug: "api-design-best-practices",
        created_at: "2023-07-15T10:30:00Z"
      },
      {
        id: 8,
        title: "Testing Svelte Applications",
        slug: "testing-svelte-applications",
        created_at: "2023-07-12T08:15:00Z"
      }
    ];
    
    loading = false;
  });
</script>

<div class="space-y-8">
  <!-- Search -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Search</h3>
    <div class="relative">
      <input
        type="text"
        placeholder="Search posts..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg
        class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>

  <!-- Categories -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
    {#if categories.length > 0}
      <ul class="space-y-2">
        {#each categories as category (category.id)}
          <li>
            <a
              href={`/blog/category/${category.slug}`}
              class="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {category.name} 
              {#if category.post_count}
                <span class="ml-1 text-sm text-gray-400">({category.post_count})</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-500 text-sm">No categories available</p>
    {/if}
  </div>

  <!-- Featured Posts -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Featured Posts</h3>
    {#if featuredPosts.length > 0}
      <div class="space-y-4">
        {#each featuredPosts as post (post.id)}
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <img
                src={post.featured_image || '/default-blog-image.jpg'}
                alt={post.title}
                class="w-16 h-16 object-cover rounded-lg"
              />
            </div>
            <div>
              <a 
                href={`/blog/${post.slug}`}
                class="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
              >
                {post.title}
              </a>
              <p class="text-sm text-gray-500 mt-1">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-gray-500 text-sm">No featured posts available</p>
    {/if}
  </div>

  <!-- Recent Posts -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-3">Recent Posts</h3>
    {#if recentPosts.length > 0}
      <ul class="space-y-3">
        {#each recentPosts as post (post.id)}
          <li>
            <a 
              href={`/blog/${post.slug}`}
              class="text-gray-600 hover:text-blue-600 transition-colors block"
            >
              <div class="font-medium">{post.title}</div>
              <div class="text-sm text-gray-500 mt-1">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-500 text-sm">No recent posts available</p>
    {/if}
  </div>

  <!-- Newsletter Signup -->
  <div class="bg-blue-50 p-4 rounded-lg">
    <h3 class="font-semibold text-gray-900 mb-2">Subscribe to Newsletter</h3>
    <p class="text-sm text-gray-600 mb-3">
      Get the latest posts delivered straight to your inbox.
    </p>
    <div class="space-y-2">
      <input
        type="email"
        placeholder="Your email address"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
      <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
        Subscribe
      </button>
    </div>
  </div>
</div>