<script lang="ts">
  import { Input } from '$lib/components/ui';
  
  let { 
    filters,
    onChange 
  } = $props<{
    filters: {
      status: string;
      category: string;
      search: string;
    };
    onChange?: (filters: { status: string; category: string; search: string }) => void;
  }>();
  
  let status = $state(filters.status);
  let category = $state(filters.category);
  let search = $state(filters.search);
  
  // Update internal values when props change
  $effect(() => {
    status = filters.status;
    category = filters.category;
    search = filters.search;
  });
  
  function handleStatusChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    status = target.value;
    onChange?.({ status, category, search });
  }
  
  function handleCategoryChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    category = target.value;
    onChange?.({ status, category, search });
  }
  
  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    search = target.value;
    onChange?.({ status, category, search });
  }
  
  function handleFilterChange() {
    onChange?.({ status, category, search });
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
<select
  id="status-select"
  bind:value={status}
  onchange={handleStatusChange}
  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
>
        <option value="all">All Statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>
    
    <div>
      <label for="category-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
<select
  id="category-select"
  bind:value={category}
  onchange={handleCategoryChange}
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
      <label for="search-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Search
      </label>
<Input
  id="search-input"
  type="text"
  bind:value={search}
  oninput={handleSearchChange}
  placeholder="Search posts..."
  class="w-full"
/>
    </div>
    
    <div class="flex items-end">
<button
  onclick={handleFilterChange}
  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
>
  Apply Filters
</button>
    </div>
  </div>
</div>