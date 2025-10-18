<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { cartStore } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // For demo purposes, we'll use mock data based on the slug
  // In a real app, this would come from +page.server.ts
  let slug = $bindable('');
  $effect(() => {
    slug = page.params.slug;
  });

  let service = $state({
    id: '1',
    title: 'Consultation Session',
    excerpt: 'Personalized consultation to understand your needs and goals',
    description: 'A comprehensive consultation session to assess your current situation and define clear objectives for your journey. This personalized session includes a thorough assessment of your current challenges, identification of key goals, and the creation of a tailored action plan to help you achieve lasting transformation.',
    base_price: 5000,
    featured: true,
    category: { id: '1', name: 'Consultation', slug: 'consultation' }
  });

  let quantity = $state(1);
  let loading = $state(false);

  const addToCart = () => {
    loading = true;
    try {
      cartStore.addItem(service, quantity);
      // Navigate to cart after adding
      goto('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      cartStore.setError('Failed to add item to cart');
    } finally {
      loading = false;
    }
  };

  const incrementQuantity = () => {
    quantity++;
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      quantity--;
    }
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex justify-between items-center mb-6">
    <button 
      on:click={() => goto('/services')}
      class="text-blue-600 hover:text-blue-500 font-medium flex items-center"
    >
      &larr; Back to Services
    </button>
  </div>

  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-8">
      {#if service.featured}
        <div class="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center mb-6">
          <span class="text-gray-500">Service Image</span>
        </div>
      {/if}
      
      <div class="flex flex-col md:flex-row justify-between">
        <div class="md:w-2/3">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
          
          <p class="text-lg text-gray-600 mb-6">
            {service.excerpt}
          </p>
          
          <div class="prose max-w-none mb-8">
            <p>{service.description}</p>
          </div>
          
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Service Details</h3>
            <ul class="list-disc pl-5 space-y-2 text-gray-600">
              <li>One-on-one personalized session</li>
              <li>Duration: 60-90 minutes</li>
              <li>Follow-up support available</li>
              <li>Customized action plan</li>
            </ul>
          </div>
        </div>
        
        <div class="md:w-1/3">
          <div class="bg-gray-50 p-6 rounded-lg sticky top-8">
            <div class="mb-6">
              <div class="text-3xl font-bold text-gray-900 mb-2">
                ₹{service.base_price?.toFixed(2)}
              </div>
              <p class="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div class="flex items-center border border-gray-300 rounded-md">
                <button
                  type="button"
                  class="px-3 py-2 border-r border-gray-300 text-gray-600 hover:text-gray-900"
                  on:click={decrementQuantity}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span class="px-4 py-2 text-center">{quantity}</span>
                <button
                  type="button"
                  class="px-3 py-2 border-l border-gray-300 text-gray-600 hover:text-gray-900"
                  on:click={incrementQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            
            <Button 
              class="w-full py-3 text-base" 
              on:click={addToCart}
              disabled={loading}
            >
              {#if loading}
                Adding to Cart...
              {:else}
                Add to Cart
              {/if}
            </Button>
            
            <div class="mt-4 text-center">
              <button 
                class="text-blue-600 hover:text-blue-500 text-sm font-medium"
                on:click={() => goto('/cart')}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>