<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { ProductService, ServiceCategory } from '$lib/types/supabase';
  import { createBrowserClient } from '@supabase/ssr';
  import { env } from '$env/dynamic/public';
  import { Button } from '$lib/components/ui/Button.svelte';
  import { cartStore } from '$lib/stores/cart';
  import { goto } from '$app/navigation';

  const supabase = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  let services = writable<ProductService[]>([]);
  let categories = writable<ServiceCategory[]>([]);
  let filteredServices = writable<ProductService[]>([]);
  let searchQuery = writable('');
  let selectedCategory = writable<string | null>(null);
  let loadingStates: Record<string, boolean> = $state({});

  onMount(async () => {
    const { data: servicesData } = await supabase.from('services').select('*');
    if (servicesData) {
      services.set(servicesData as ProductService[]);
      filteredServices.set(servicesData as ProductService[]);
    }

    const { data: categoriesData } = await supabase.from('service_categories').select('*');
    if (categoriesData) {
      categories.set(categoriesData as ServiceCategory[]);
    }
  });

  function handleSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    searchQuery.set(query);
  }

  function handleCategoryChange(event: Event) {
    const categoryId = (event.target as HTMLSelectElement).value;
    selectedCategory.set(categoryId);
  }

  $: {
    let allServices: ProductService[] = [];
    services.subscribe(value => allServices = value)();
    let query = '';
    searchQuery.subscribe(value => query = value)();
    let categoryId: string | null = null;
    selectedCategory.subscribe(value => categoryId = value)();

    let filtered = allServices;

    if (query) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (categoryId) {
      filtered = filtered.filter(service => service.category_id === categoryId);
    }

    filteredServices.set(filtered);
  }

  function addToCart(service: ProductService) {
    if (loadingStates[service.id]) return;
    
    // Set loading state
    loadingStates[service.id] = true;
    
    try {
      // Add to cart using the existing cart store
      const serviceForCart = {
        id: service.id,
        title: service.title,
        excerpt: service.description || service.title,
        description: service.description,
        base_price: service.base_price || 0,
        featured: service.featured
      };
      
      cartStore.addItem(serviceForCart, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      cartStore.setError('Failed to add item to cart');
    } finally {
      // Remove loading state
      delete loadingStates[service.id];
    }
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Our Offerings</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Discover our range of specialized services designed to support your personal growth and transformation journey.
    </p>
  </div>

  <div class="flex flex-col md:flex-row justify-between mb-8 gap-4">
    <input 
      type="text" 
      placeholder="Search services..." 
      on:input={handleSearch} 
      class="px-4 py-2 border border-gray-300 rounded-md flex-1"
    >
    <select 
      on:change={handleCategoryChange} 
      class="px-4 py-2 border border-gray-300 rounded-md"
    >
      <option value="">All Categories</option>
      {#each $categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each $filteredServices as service}
      <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
          <p class="text-gray-600 mb-4">{service.description}</p>
          
          <div class="flex items-center justify-between">
            <div class="text-2xl font-bold text-gray-900">
              ₹{service.base_price?.toFixed(2) || 'TBD'}
            </div>
            
            <Button 
              on:click={() => addToCart(service)}
              disabled={!!loadingStates[service.id]}
            >
              {#if loadingStates[service.id]}
                Adding...
              {:else}
                Add to Cart
              {/if}
            </Button>
          </div>
          
          {#if service.featured}
            <div class="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Featured
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
