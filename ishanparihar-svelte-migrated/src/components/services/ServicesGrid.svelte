<script>
  import type { Service } from '$lib/types/cart';
  import { Button } from '$lib/components/ui/Button.svelte';
  import { cartStore } from '$lib/stores/cart';

  let { services }: { services: Service[] } = $props();
  let loadingStates = $state<Record<string, boolean>>({});

  const addToCart = (service: Service) => {
    if (loadingStates[service.id]) return;
    
    loadingStates[service.id] = true;
    try {
      cartStore.addItem(service, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      cartStore.setError('Failed to add item to cart');
    } finally {
      loadingStates[service.id] = false;
    }
  };
</script>

{#if services && services.length > 0}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each services as service}
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
          <p class="text-gray-600 mb-4">{service.excerpt}</p>
          
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium text-gray-900">
              ₹{service.base_price?.toFixed(2) || 'TBD'}
            </span>
            
            <Button 
              variant="outline" 
              class="text-sm"
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
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="text-center py-12">
    <p class="text-gray-500">No services available at the moment.</p>
  </div>
{/if}