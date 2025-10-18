<script>
  import ServicesHero from '$lib/components/services/ServicesHero.svelte';
  import ServicesGrid from '$lib/components/services/ServicesGrid.svelte';
  import ServicesFilters from '$lib/components/services/ServicesFilters.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  
  // Simulated services data - in real app, this would come from a +page.server.ts
  let services = $state([
    {
      id: '1',
      title: 'Consultation Session',
      excerpt: 'Personalized consultation to understand your needs and goals',
      description: 'A comprehensive consultation session to assess your current situation and define clear objectives for your journey.',
      base_price: 5000,
      featured: true,
      category: { id: '1', name: 'Consultation', slug: 'consultation' }
    },
    {
      id: '2',
      title: 'Intensive Program',
      excerpt: 'Comprehensive program for deep transformation',
      description: 'An intensive program designed to create lasting change through structured guidance and support.',
      base_price: 25000,
      featured: true,
      category: { id: '2', name: 'Programs', slug: 'programs' }
    },
    {
      id: '3',
      title: 'Online Course',
      excerpt: 'Self-paced learning with expert guidance',
      description: 'Access to our comprehensive online course material with ongoing support and resources.',
      base_price: 8000,
      featured: false,
      category: { id: '3', name: 'Courses', slug: 'courses' }
    }
  ]);

  let categories = $state([
    { id: '1', name: 'Consultation', slug: 'consultation' },
    { id: '2', name: 'Programs', slug: 'programs' },
    { id: '3', name: 'Courses', slug: 'courses' }
  ]);

  let selectedCategory = $state(null);
  let sortBy = $state('featured');
  let loading = $state(false);

  const handleFilterChange = ({ category, sortBy: newSortBy }) => {
    selectedCategory = category;
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
            {selectedCategory 
              ? `${categories.find(c => c.slug === selectedCategory)?.name} Services` 
              : 'All Services'}
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