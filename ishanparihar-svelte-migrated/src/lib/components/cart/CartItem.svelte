<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import type { CartItem as CartItemType } from '$lib/types/cart';
  
  const { item } = $props<{ item: CartItemType }>();
  
  function updateQuantity(quantity: number) {
    if (quantity < 1) quantity = 1;
    // In a real app, this would dispatch an event to update the cart
    const event = new CustomEvent('update', { 
      detail: { 
        id: item.service.id, 
        quantity 
      } 
    });
    dispatchEvent(event);
  }
  
  function removeFromCart() {
    // In a real app, this would dispatch an event to remove from cart
    const event = new CustomEvent('remove', { 
      detail: { id: item.service.id } 
    });
    dispatchEvent(event);
  }
</script>

<div class="px-4 py-6 sm:px-6">
  <div class="flex items-center">
     <div class="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
       {#if item.service.cover_image}
         <img 
           src={item.service.cover_image} 
           alt={item.service.title}
           class="w-full h-full object-cover"
         />
       {:else}
         <div class="w-full h-full bg-gray-200 flex items-center justify-center">
           <span class="text-gray-500">No Image</span>
         </div>
       {/if}
     </div>
     
     <div class="ml-4 flex-1">
       <div class="flex items-baseline justify-between">
         <h3 class="text-base font-medium text-gray-900">
           {item.service.title}
         </h3>
         <p class="ml-4 text-base font-medium text-gray-900">
           ${item.service.price ? (item.service.price * item.quantity).toFixed(2) : '0.00'}
         </p>
       </div>
       <p class="mt-1 text-sm text-gray-500 line-clamp-2">
         {item.service.description}
       </p>
      <div class="mt-2 flex items-center justify-between">
        <div class="flex items-center">
          <button 
            onclick={() => updateQuantity(item.quantity - 1)}
            class="px-2 py-1 bg-gray-100 rounded-l text-gray-600 hover:bg-gray-200"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span class="px-3 py-1 bg-gray-50 border-y text-center min-w-[40px]">
            {item.quantity}
          </span>
          <button 
            onclick={() => updateQuantity(item.quantity + 1)}
            class="px-2 py-1 bg-gray-100 rounded-r text-gray-600 hover:bg-gray-200"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button 
          onclick={removeFromCart}
          class="text-sm font-medium text-red-600 hover:text-red-500"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</div>