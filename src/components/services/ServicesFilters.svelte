<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ServiceCategory } from '$lib/types/cart';
  
  let filters = $props<any>({});
  let categories = $props<any[]>([]);
  
  const dispatch = createEventDispatcher();
  
  let localFilters = $state({ ...filters });
  
  function applyFilters() {
    dispatch('change', localFilters);
  }
  
  function resetFilters() {
    localFilters = {
      category: '',
      serviceType: '',
      featured: false,
      search: '',
      minPrice: null,
      maxPrice: null
    };
    dispatch('change', localFilters);
  }
</script>

<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Search
      </label>
         <input
           id="search"
           type="text"
           placeholder="Search services..."
           class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           bind:value={localFilters.search}
           oninput={applyFilters}
         />
    </div>
    
    <!-- Category -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
         <select
           id="category"
           class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           bind:value={localFilters.category}
           onchange={applyFilters}
         >
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category.slug}>{category.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Service Type -->
    <div>
      <label for="serviceType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Service Type
      </label>
         <select
           id="serviceType"
           class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           bind:value={localFilters.serviceType}
           onchange={applyFilters}
         >
        <option value="">All Types</option>
        <option value="consulting">Consulting</option>
        <option value="development">Development</option>
        <option value="training">Training</option>
        <option value="support">Support</option>
      </select>
    </div>
    
    <!-- Featured -->
    <div class="flex items-end">
      <div class="flex items-center">
         <input
           id="featured"
           type="checkbox"
           class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
           bind:checked={localFilters.featured}
           onchange={applyFilters}
         />
        <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Featured Only
        </label>
      </div>
     </div>
   </div>
   
   <!-- Price Range -->
   <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="minPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Min Price
        </label>
         <input
           id="minPrice"
           type="number"
           placeholder="Min"
           class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           bind:value={localFilters.minPrice}
           oninput={applyFilters}
         />
      </div>
      
      <div>
        <label for="maxPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Price
        </label>
         <input
           id="maxPrice"
           type="number"
           placeholder="Max"
           class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           bind:value={localFilters.maxPrice}
           oninput={applyFilters}
         />
      </div>
    </div>
  </div>
  
  <!-- Reset Button -->
  <div class="mt-4 flex justify-end">
     <button
       type="button"
       class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
       onclick={resetFilters}
     >
      Reset Filters
    </button>
  </div>