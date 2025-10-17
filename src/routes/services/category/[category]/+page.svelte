<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  
  // Define components that will be imported later
  let ServicesGrid;
  let ServicesFilters;
  let ServicesHero;
  
  // Dynamically import components
  onMount(async () => {
    const { default: ServicesGridComp } = await import('$components/services/ServicesGrid.svelte');
    const { default: ServicesFiltersComp } = await import('$components/services/ServicesFilters.svelte');
    const { default: ServicesHeroComp } = await import('$components/services/ServicesHero.svelte');
    
    ServicesGrid = ServicesGridComp;
    ServicesFilters = ServicesFiltersComp;
    ServicesHero = ServicesHeroComp;
  });
  
  let services = $state([]);
  let categories = $state([]);
  let loading = $state(true);
  let pagination = $state({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    category: $page.params.category || '',
    serviceType: '',
    featured: false,
    search: '',
    minPrice: null,
    maxPrice: null
  });
  
  // Load services and categories
 onMount(async () => {
    await Promise.all([
      loadServices(),
      loadCategories()
    ]);
  });
  
  async function loadServices() {
    try {
      loading = true;
      const response = await apiClient.services.getServices({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      services = response.services;
      pagination = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      loading = false;
    }
 }
  
  async function loadCategories() {
    try {
      categories = await apiClient.services.getCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }
  
  function handleFilterChange(newFilters: any) {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadServices();
  }
  
  function handlePageChange(newPage: number) {
    pagination.page = newPage;
    loadServices();
  }
</script>

<svelte:head>
  <title>{filters.category} Services - Our Offerings</title>
  <meta name="description" content={`Explore our ${filters.category} services designed to help you grow.`} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Hero Section -->
  {#if ServicesHero}
    <svelte:component this={ServicesHero} />
  {/if}
  
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Filters -->
    {#if ServicesFilters}
      <svelte:component 
        this={ServicesFilters}
        {filters}
        {categories}
        on:change={(e) => handleFilterChange(e.detail)}
      />
    {/if}
    
    <!-- Services Grid -->
    {#if ServicesGrid}
      <svelte:component 
        this={ServicesGrid}
        {services}
        {loading}
        {pagination}
        on:pageChange={(e) => handlePageChange(e.detail)}
      />
    {/if}
    
    <!-- No Results -->
    {#if !loading && services.length === 0}
      <div class="text-center py-12">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    {/if}
 </div>
</div>