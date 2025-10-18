<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cartStore } from '$lib/stores/cart';
  
  let service = $state({
    id: '1',
    title: 'AI Consulting',
    excerpt: 'Expert guidance on AI implementation',
    description: 'Comprehensive AI consulting services to help you leverage artificial intelligence for your business. Our team of experts will guide you through the entire process of implementing AI solutions tailored to your specific needs.',
    base_price: 1500,
    featured: true,
    category: { name: 'Consulting', slug: 'consulting' },
    pricing: [{ type: 'fixed', price: 1500 }]
  });
  
  let quantity = $state(1);
  
  onMount(() => {
    // In a real implementation, we would fetch the service details based on the slug
    // For now, we'll use mock data
     const slug = page.params.slug;
    console.log('Service slug:', slug);
  });
  
  function handleAddToCart() {
    cartStore.addItem(service, quantity);
    goto('/cart');
  }
</script>

<svelte:head>
  <title>{service.title} - Our Services</title>
  <meta name="description" content={service.excerpt} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <!-- Service Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between">
          <div class="flex-1">
            <div class="flex items-center">
              {#if service.featured}
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mr-3">
                  Featured
                </span>
              {/if}
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {service.category?.name}
              </span>
            </div>
            
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-3">{service.title}</h1>
            <p class="text-lg text-gray-600 dark:text-gray-300 mt-2">{service.excerpt}</p>
          </div>
          
          <div class="mt-6 md:mt-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{service.base_price?.toLocaleString()}</div>
            <div class="mt-4">
              <label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={quantity}
              />
            </div>
             <button
               class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300"
               onclick={handleAddToCart}
             >
              Add to Cart
            </button>
             <button
               class="mt-2 w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-md transition-colors duration-300"
               onclick={() => goto('/services')}
             >
              Back to Services
            </button>
          </div>
        </div>
        
        <!-- Service Description -->
        <div class="mt-8 prose prose-gray dark:prose-invert max-w-none">
          <h2 class="text-xl font-bold text-gray-90 dark:text-white">Service Details</h2>
          <p>{service.description}</p>
          
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6">What You'll Get</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>Comprehensive AI strategy consultation</li>
            <li>Custom solution architecture design</li>
            <li>Implementation roadmap</li>
            <li>Technical documentation</li>
            <li>Post-implementation support</li>
          </ul>
          
          <h3 class="text-lg font-semibold text-gray-90 dark:text-white mt-6">Pricing Options</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Price</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {#each service.pricing as pricing}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{pricing.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{pricing.price.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {pricing.type === 'fixed' ? 'One-time fixed fee' : 'Hourly rate'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>