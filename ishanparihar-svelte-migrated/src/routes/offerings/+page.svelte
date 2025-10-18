<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { ProductService, ServiceCategory } from '$lib/types/supabase';
  import { createBrowserClient } from '@supabase/ssr';
  import { env } from '$env/dynamic/public';

  const supabase = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  let services = writable<ProductService[]>([]);
  let categories = writable<ServiceCategory[]>([]);
  let filteredServices = writable<ProductService[]>([]);
  let searchQuery = writable('');
  let selectedCategory = writable<string | null>(null);

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
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">Our Offerings</h1>

  <div class="flex justify-between mb-4">
    <input type="text" placeholder="Search services..." on:input={handleSearch} class="px-4 py-2 border rounded-md w-1/2">
    <select on:change={handleCategoryChange} class="px-4 py-2 border rounded-md">
      <option value="">All Categories</option>
      {#each $categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each $filteredServices as service}
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-bold">{service.title}</h2>
        <p>{service.description}</p>
      </div>
    {/each}
  </div>
</div>
