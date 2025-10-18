<script>
  import { Button } from '$lib/components/ui/Button.svelte';

  let { 
    categories = [],
    selectedCategory = null,
    sortBy = 'featured',
    onFilterChange
  }: { 
    categories: { id: string; name: string; slug: string }[];
    selectedCategory: string | null;
    sortBy: string;
    onFilterChange: (filters: { category: string | null; sortBy: string }) => void;
  } = $props();

  let localCategory = $state(selectedCategory);
  let localSortBy = $state(sortBy);

  const applyFilters = () => {
    onFilterChange({
      category: localCategory,
      sortBy: localSortBy
    });
  };

  const resetFilters = () => {
    localCategory = null;
    localSortBy = 'featured';
    onFilterChange({
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
      <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
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
      <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
      <select
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
      <Button type="button" on:click={applyFilters} class="flex-1">
        Apply Filters
      </Button>
      <Button type="button" variant="outline" on:click={resetFilters}>
        Reset
      </Button>
    </div>
  </div>
</div>