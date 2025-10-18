<script lang="ts">
  import ServicesHero from '$lib/components/services/ServicesHero.svelte';
  import ServicesGrid from '$lib/components/services/ServicesGrid.svelte';
  import ServicesFilters from '$lib/components/services/ServicesFilters.svelte';
  import { page } from '$app/stores';
  
  let category = $state<string | undefined>(undefined);
  
  $effect(() => {
    const unsubscribe = page.subscribe(($page) => {
      const paramCategory = $page.params.category;
      if (paramCategory) {
        category = paramCategory;
      }
    });
    return unsubscribe;
  });

  // Simulated services data filtered by category - in real app, this would come from a +page.server.ts
  let services = $state([
    {
      id: '1',
      title: 'Consultation Session',
      excerpt: 'Personalized consultation to understand your needs and goals',
      description: 'A comprehensive consultation session to assess your current situation and define clear objectives for your journey.',
      price: 5000,
      featured: true,
      category: { id: '1', name: 'Consultation', slug: 'consultation' }
    },
    {
      id: '2',
      title: 'Follow-up Session',
      excerpt: 'Additional session for continued progress',
      description: 'A follow-up session to continue your transformation journey with ongoing support.',
      price: 4000,
      featured: false,
      category: { id: '1', name: 'Consultation', slug: 'consultation' }
    }
  ]);

  let categories = $state([
    { id: '1', name: 'Consultation', slug: 'consultation' },
    { id: '2', name: 'Programs', slug: 'programs' },
    { id: '3', name: 'Courses', slug: 'courses' }
  ]);

  let selectedCategory = $derived(category || '');
  let sortBy = $state('featured');
  let loading = $state(false);

  const handleFilterChange = (e: CustomEvent<{ category: string | null; sortBy: string }>) => {
    const { category: newCategory, sortBy: newSortBy } = e.detail;
    selectedCategory = newCategory || '';
    sortBy = newSortBy;
    
    // Simulate filtering and sorting
    loading = true;
    setTimeout(() => {
      // In a real app, this would be handled by server load function
      // For demo purposes, we'll just set loading to false
      loading = false;
    }, 300);
  };
</script>

<div>
  <ServicesHero />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/4">
        <ServicesFilters 
          {categories} 
          {selectedCategory} 
          {sortBy}
          on:filterChange={handleFilterChange}
        />
      </div>
      
      <div class="lg:w-3/4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {categories.find(c => c.slug === selectedCategory)?.name || 'Services'} Services
          </h2>
          
          <div class="text-sm text-gray-500">
            Showing {services.length} services
          </div>
        </div>
        
        {#if loading}
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        {:else}
          <ServicesGrid {services} />
        {/if}
      </div>
    </div>
  </div>
</div>