<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let { 
    categories = [],
    selectedCategory = null,
    sortBy = 'featured'
  }: { 
    categories: { id: string; name: string; slug: string }[];
    selectedCategory: string | null;
    sortBy: string;
  } = $props();

  let localCategory = $state(selectedCategory);
  let localSortBy = $state(sortBy);

  const dispatch = createEventDispatcher<{ filterChange: { category: string | null; sortBy: string } }>();

  const applyFilters = () => {
    dispatch('filterChange', { 
      category: localCategory,
      sortBy: localSortBy
    });
  };

  const resetFilters = () => {
    localCategory = null;
    localSortBy = 'featured';
    dispatch('filterChange', { 
      category: null,
      sortBy: 'featured'
    });
  };
</script>

<div class="bg-white p-6 rounded-lg shadow-sm">
  <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
  
  <div class="space-y-6">
    <!-- Category Filter -->
    <div>
      <label for="category-select" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
        id="category-select"
        bind:value={localCategory}
        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category.slug}>{category.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Sort By -->
    <div>
      <label for="sort-select" class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
      <select
        id="sort-select"
        bind:value={localSortBy}
        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name A-Z</option>
        <option value="newest">Newest First</option>
      </select>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex space-x-3">
<Button type="button" onclick={applyFilters} class="flex-1">
  Apply Filters
</Button>
<Button type="button" variant="outline" onclick={resetFilters}>
  Reset
</Button>
    </div>
  </div>
</div>