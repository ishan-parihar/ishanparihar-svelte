<script lang="ts">
  import { cartStore } from '$lib/stores/cart';
  import type { CartItem as CartItemType } from '$lib/types/cart';
  import Button from '$lib/components/ui/Button.svelte';

  let { item }: { item: CartItemType } = $props();
  let loadingId = $state<string | null>(null);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem();
      return;
    }

    loadingId = item.service.id;
    try {
      cartStore.updateQuantity(item.service.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      cartStore.setError('Failed to update item quantity');
    } finally {
      loadingId = null;
    }
  };

  const removeItem = async () => {
    loadingId = item.service.id;
    try {
      cartStore.removeItem(item.service.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      cartStore.setError('Failed to remove item from cart');
    } finally {
      loadingId = null;
    }
  };

  const increment = () => {
    updateQuantity(item.quantity + 1);
  };

  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.quantity - 1);
    } else {
      updateQuantity(0); // This will remove the item
    }
  };
</script>

<div class="border-b border-gray-200 py-6">
  <div class="flex items-center space-x-4">
    {#if item.service.featured}
      <div class="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <span class="text-gray-500 text-sm">Image</span>
      </div>
    {/if}
    
    <div class="flex-1">
      <h3 class="text-lg font-medium text-gray-900">{item.service.title}</h3>
      <p class="text-gray-500 text-sm mt-1">{item.service.excerpt}</p>
      
      <div class="flex items-center mt-4 space-x-3">
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          on:click={decrement}
          disabled={!!loadingId}
          aria-label="Decrease quantity"
        >
          <span class="text-lg">-</span>
        </Button>
        
        <span class="text-lg font-medium w-8 text-center">{item.quantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          on:click={increment}
          disabled={!!loadingId}
          aria-label="Increase quantity"
        >
          <span class="text-lg">+</span>
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          class="ml-2"
          on:click={removeItem}
          disabled={!!loadingId}
        >
          {#if loadingId === item.service.id}
            Removing...
          {:else}
            Remove
          {/if}
        </Button>
      </div>
    </div>
    
    <div class="text-right">
      <p class="text-lg font-medium text-gray-900">
        ₹{(item.service.base_price || 0) * item.quantity}
      </p>
      <p class="text-sm text-gray-500">
        ₹{item.service.base_price || 0} × {item.quantity}
      </p>
    </div>
  </div>
</div>