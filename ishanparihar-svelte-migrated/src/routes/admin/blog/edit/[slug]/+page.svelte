<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string;
    isPublished: boolean;
    metaTitle: string;
    metaDescription: string;
    featuredImage: string;
    createdAt: string;
    updatedAt: string;
  }
  
  let slug = $state('');
  
  $effect(() => {
    const unsubscribe = page.subscribe((p) => {
      slug = p.params.slug ?? '';
    });
    return unsubscribe;
  });

  let blogData = $state<BlogPost>({
    id: '1',
    title: 'Getting Started with Svelte 5',
    slug: 'getting-started-with-svelte-5',
    excerpt: 'Learn the basics of Svelte 5 and its new features',
    content: '# Getting Started with Svelte 5\n\nSvelte 5 is a revolutionary new version of the Svelte framework that introduces runes, a new reactivity system that provides more explicit control over reactive state in your components.\n\n## Key Features of Svelte 5\n\n- Runes for explicit reactivity\n- Improved performance\n- Better TypeScript support\n- Enhanced component architecture',
    category: 'technology',
    tags: 'svelte, framework, web-development',
    isPublished: true,
    metaTitle: 'Getting Started with Svelte 5 - Complete Guide',
    metaDescription: 'Learn how to get started with Svelte 5, the latest version of the Svelte framework with new runes and reactivity features.',
    featuredImage: '',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-20T14:45:00Z'
  });

  let loading = $state(false);
  let error = $state<string | null>(null);
  let isSaving = $state(false);
  let isPreview = $state(false);

  onMount(() => {
    // In real app, this would fetch blog data from server based on slug
    console.log('Loading blog post with slug:', slug);
  });

  const handleFieldChange = (field: keyof BlogPost, value: string | boolean) => {
    blogData = {
      ...blogData,
      [field]: value
    };
    
    // Auto-generate slug from title if editing title and slug is empty
    if (field === 'title' && !blogData.slug) {
      blogData = {
        ...blogData,
        slug: blogData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      };
    }
  };

  const handleSave = async (e: Event) => {
    e.preventDefault();
    isSaving = true;
    error = null;

    try {
      // Simulate API call to update blog post
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updating blog post:', blogData);
      // In a real app, this would call an API endpoint
      // await apiClient.admin.blog.updatePost(blogData);

      // Redirect to blog listing
      goto('/admin/blog');
    } catch (err) {
      error = 'Failed to update blog post';
      console.error('Error updating blog:', err);
    } finally {
      isSaving = false;
    }
  };

  const handlePreview = () => {
    // Toggle preview mode
    isPreview = !isPreview;
  };

  const handleCancel = () => {
    goto('/admin/blog');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        // Simulate API call to delete blog post
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Deleting blog post:', blogData.id);
        // In a real app, this would call an API endpoint
        // await apiClient.admin.blog.deletePost(blogData.id);

        // Redirect to blog listing
        goto('/admin/blog');
      } catch (err) {
        error = 'Failed to delete blog post';
        console.error('Error deleting blog:', err);
      }
    }
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-center justify-between mb-6">
     <button 
       onclick={() => goto('/admin/blog')}
       class="text-blue-600 hover:text-blue-500 font-medium flex items-center"
     >
       &larr; Back to Blog Management
     </button>
    
    <div class="flex space-x-3">
       <Button 
         variant="outline" 
         onclick={handlePreview}
         disabled={isSaving}
       >
         {isPreview ? 'Edit' : 'Preview'}
       </Button>
       <Button 
         variant="outline" 
         onclick={handleCancel}
         disabled={isSaving}
       >
         Cancel
       </Button>
       <Button 
         onclick={handleSave}
         disabled={isSaving}
       >
         {#if isSaving}
           Saving...
         {:else}
           Save Changes
         {/if}
       </Button>
    </div>
  </div>

  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Blog Post</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Update your blog post content, SEO settings, and publishing options
      </p>
    </div>
    
    <div class="px-4 py-5 sm:p-6">
      {#if error}
        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      {/if}

       <form onsubmit={handleSave}>
        <div class="grid grid-cols-1 gap-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              bind:value={blogData.title}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog title"
              required
            />
            <p class="mt-1 text-sm text-gray-500">The main title of your blog post</p>
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              bind:value={blogData.slug}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="enter-slug-here"
              required
            />
            <p class="mt-1 text-sm text-gray-500">URL-friendly identifier for the post</p>
          </div>

          <!-- Excerpt -->
          <div>
            <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              bind:value={blogData.excerpt}
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the post content"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">A short description that appears in search results</p>
          </div>

          <!-- Content -->
          {#if !isPreview}
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                id="content"
                bind:value={blogData.content}
                rows="12"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your blog content here..."
                required
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">
                Content can include markdown formatting. For a rich editor, consider integrating a WYSIWYG editor.
              </p>
            </div>
           {:else}
             <div>
               <p class="block text-sm font-medium text-gray-700 mb-1">
                 Content Preview
               </p>
               <div class="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                 {@html blogData.content
                   .replace(/\n/g, '<br>')
                   .replace(/# (.+)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                   .replace(/## (.+)/g, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
                   .replace(/### (.+)/g, '<h3 class="text-lg font-bold mt-2 mb-2">$1</h3>')
                   .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.+?)\*/g, '<em>$1</em>')
                 }
               </div>
             </div>
           {/if}

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              bind:value={blogData.category}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="development">Development</option>
              <option value="business">Business</option>
              <option value="tutorials">Tutorials</option>
              <option value="news">News</option>
            </select>
            <p class="mt-1 text-sm text-gray-500">Category for organizing your blog posts</p>
          </div>

          <!-- Tags -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              bind:value={blogData.tags}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
            <p class="mt-1 text-sm text-gray-500">Comma-separated tags for the post</p>
          </div>

          <!-- Featured Image -->
          <div>
            <label for="featuredImage" class="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL
            </label>
            <input
              id="featuredImage"
              type="text"
              bind:value={blogData.featuredImage}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p class="mt-1 text-sm text-gray-500">URL to the featured image for this post</p>
          </div>

          <!-- SEO Section -->
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h4>
            
            <div class="space-y-4">
              <!-- Meta Title -->
              <div>
                <label for="metaTitle" class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  bind:value={blogData.metaTitle}
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title for search engines"
                  maxlength="60"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Recommended: Keep it under 60 characters
                </p>
              </div>

              <!-- Meta Description -->
              <div>
                <label for="metaDescription" class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  bind:value={blogData.metaDescription}
                  rows="3"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description for search engines"
                  maxlength="160"
                ></textarea>
                <p class="mt-1 text-sm text-gray-500">
                  Recommended: Keep it under 160 characters
                </p>
              </div>
            </div>
          </div>

          <!-- Publishing Options -->
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Publishing Options</h4>
            
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="isPublished"
                  type="checkbox"
                  bind:checked={blogData.isPublished}
                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="isPublished" class="font-medium text-gray-700">
                  Publish immediately
                </label>
                <p class="text-gray-500">
                  Check this to publish the post immediately after creating
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex justify-between">
           <Button 
             variant="destructive" 
             onclick={handleDelete}
             disabled={isSaving}
           >
             Delete Post
           </Button>
           
           <div class="flex space-x-3">
             <Button 
               type="button" 
               variant="outline" 
               onclick={handleCancel}
               disabled={isSaving}
             >
               Cancel
             </Button>
             <Button 
               type="submit" 
               disabled={isSaving}
             >
              {#if isSaving}
                Saving...
              {:else}
                Save Changes
              {/if}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>