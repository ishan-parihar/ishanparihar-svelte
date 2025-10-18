<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  let { 
    title = '',
    content = '',
    excerpt = '',
    slug = '',
    tags = [] as string[],
    published = false,
    featured = false
  } = $props<{ 
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
  }>();
  
  // Create separate reactive state for internal values to be able to modify them
  let internalTitle = $state(title);
  let internalContent = $state(content);
  let internalExcerpt = $state(excerpt);
  let internalSlug = $state(slug);
  let internalTags = $state<string[]>([...tags]);
  let internalPublished = $state(published);
  let internalFeatured = $state(featured);
  
  let error: string | null = $state(null);
  let loading = $state(false);
  let tagInput = $state('');
  let showPreview = $state(false);
  
  // Set up event dispatcher
  const dispatch = createEventDispatcher<{ update: any }>();
  
  function updateTitle(e: Event) {
    const target = e.target as HTMLInputElement;
    internalTitle = target.value;
    if (!internalSlug) {
      internalSlug = target.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    }
    dispatch('update', { title: internalTitle, slug: internalSlug });
  }
  
  function updateContent(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    internalContent = target.value;
    dispatch('update', { content: internalContent });
  }
  
  function updateExcerpt(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    internalExcerpt = target.value;
    dispatch('update', { excerpt: internalExcerpt });
  }
  
  function updateSlug(e: Event) {
    const target = e.target as HTMLInputElement;
    internalSlug = target.value;
    dispatch('update', { slug: internalSlug });
  }
  
  function updatePublished(e: Event) {
    const target = e.target as HTMLInputElement;
    internalPublished = target.checked;
    dispatch('update', { published: internalPublished });
  }
  
  function updateFeatured(e: Event) {
    const target = e.target as HTMLInputElement;
    internalFeatured = target.checked;
    dispatch('update', { featured: internalFeatured });
  }
  
  function addTag() {
    if (tagInput.trim() && !internalTags.includes(tagInput.trim())) {
      internalTags = [...internalTags, tagInput.trim()];
      dispatch('update', { tags: internalTags });
      tagInput = '';
    }
  }
  
  function removeTag(tag: string) {
    internalTags = internalTags.filter((t: string) => t !== tag);
    dispatch('update', { tags: internalTags });
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  }
</script>

<style>
  .tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    margin: 0.25rem;
    background-color: #e2e8f0;
    border-radius: 9999px;
    font-size: 0.875rem;
  }
  
  .tag-chip button {
    margin-left: 0.5rem;
    background: none;
    border: none;
    color: #4a5568;
    cursor: pointer;
    font-size: 0.75rem;
  }
</style>

<div class="space-y-6">
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{error}</p>
    </div>
  {/if}
  
  <!-- Title -->
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
    <input
      id="title"
      name="title"
      type="text"
      bind:value={internalTitle}
      oninput={updateTitle}
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Enter blog post title"
    />
  </div>
  
  <!-- Slug -->
  <div>
    <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
    <input
      id="slug"
      name="slug"
      type="text"
      bind:value={internalSlug}
      oninput={updateSlug}
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="blog-post-slug"
    />
  </div>
  
  <!-- Excerpt -->
  <div>
    <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
    <textarea
      id="excerpt"
      name="excerpt"
      bind:value={internalExcerpt}
      oninput={updateExcerpt}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Brief description of the post..."
    ></textarea>
  </div>
  
   <!-- Tags -->
   <div>
     <label for="tag-input" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
     <div class="flex flex-wrap gap-2 mb-2">
       {#each tags as tag (tag)}
         <span class="tag-chip">
           {tag}
            <button onclick={() => removeTag(tag)} type="button">×</button>
         </span>
       {/each}
     </div>
     <div class="flex">
<input
          id="tag-input"
          type="text"
          bind:value={tagInput}
          onkeydown={handleKeyDown}
          placeholder="Add a tag..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
       <button
         onclick={addTag}
         type="button"
         class="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300"
       >
         Add
       </button>
     </div>
   </div>
  
  <!-- Content -->
  <div>
    <div class="flex justify-between items-center mb-1">
      <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
      <button
        onclick={() => showPreview = !showPreview}
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        {showPreview ? 'Edit' : 'Preview'}
      </button>
    </div>
    
    {#if showPreview}
      <div class="bg-white border border-gray-300 rounded-lg p-4 min-h-[200px]">
        {@html content}
      </div>
    {:else}
      <textarea
        id="content"
        name="content"
        bind:value={internalContent}
        oninput={updateContent}
        rows="15"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        placeholder="Write your blog content in Markdown or HTML..."
      ></textarea>
    {/if}
  </div>
  
  <!-- Options -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="flex items-center">
      <input
        id="published"
        type="checkbox"
        checked={internalPublished}
        onchange={updatePublished}
        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label for="published" class="ml-2 block text-sm text-gray-900">Publish</label>
    </div>
    
    <div class="flex items-center">
      <input
        id="featured"
        type="checkbox"
        checked={internalFeatured}
        onchange={updateFeatured}
        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label for="featured" class="ml-2 block text-sm text-gray-900">Featured</label>
    </div>
  </div>
</div>