<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Input } from '$lib/components/ui/Input.svelte';
  
  export let filters: {
    status: string;
    category: string;
    search: string;
  };
  
  const dispatch = createEventDispatcher();
  
  let status = filters.status;
  let category = filters.category;
  let search = filters.search;
  
  // Update internal values when props change
  $: status = filters.status;
  $: category = filters.category;
  $: search = filters.search;
  
  function handleStatusChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    status = target.value;
    dispatch('change', { status });
  }
  
  function handleCategoryChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    category = target.value;
    dispatch('change', { category });
  }
  
  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    search = target.value;
    dispatch('change', { search });
  }
  
  function handleFilterChange() {
    dispatch('change', { status, category, search });
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        bind:value={status}
        on:change={handleStatusChange}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        bind:value={category}
        on:change={handleCategoryChange}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Categories</option>
        <option value="technology">Technology</option>
        <option value="business">Business</option>
        <option value="lifestyle">Lifestyle</option>
        <option value="education">Education</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Search
      </label>
      <Input
        type="text"
        bind:value={search}
        on:input={handleSearchChange}
        placeholder="Search posts..."
        class="w-full"
      />
    </div>
    
    <div class="flex items-end">
      <button
        on:click={handleFilterChange}
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  </div>
</div>