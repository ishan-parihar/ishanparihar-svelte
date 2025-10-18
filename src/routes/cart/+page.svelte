<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cartStore, cartCalculations } from '$lib/stores/cart';
  import { apiClient } from '$lib/api/client';
  
   // Define components that will be imported later
   let CartItem = $state();
   let CartSummary = $state();
   let EmptyCart = $state();
  
  // Dynamically import components
  onMount(async () => {
     const { default: CartItemComp } = await import('$lib/components/cart/CartItem.svelte');
     const { default: CartSummaryComp } = await import('$lib/components/cart/CartSummary.svelte');
     const { default: EmptyCartComp } = await import('$lib/components/cart/EmptyCart.svelte');
    
    CartItem = CartItemComp;
    CartSummary = CartSummaryComp;
    EmptyCart = EmptyCartComp;
  });
  
  let cart = $state(cartStore.state);
  
  // Subscribe to cart changes
  onMount(() => {
    // Since we're using runes, we can directly access the state
    // The cartCalculations function will be reactive
  });
  
  function handleCheckout() {
    if (cartStore.state.items.length === 0) return;
    goto('/checkout');
  }
  
  function handleContinueShopping() {
    goto('/services');
  }
  
  function handleItemUpdate(serviceId: string, quantity: number) {
    cartStore.updateQuantity(serviceId, quantity);
  }
  
 function handleItemRemove(serviceId: string) {
    cartStore.removeItem(serviceId);
  }
</script>

<svelte:head>
  <title>Shopping Cart</title>
 <meta name="description" content="Review your selected services and proceed to checkout." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Shopping Cart
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Review your selected services before checkout
      </p>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if cartStore.state.items.length === 0}
       {#if EmptyCart}
         <EmptyCart 
           on:continueShopping={handleContinueShopping} 
         />
       {/if}
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          {#each cartStore.state.items as item (item.service.id)}
             {#if CartItem}
               <CartItem
                 {item}
                 on:update={(e) => handleItemUpdate(item.service.id, e.detail)}
                 on:remove={() => handleItemRemove(item.service.id)}
               />
             {/if}
          {/each}
          
          <!-- Continue Shopping -->
          <div class="mt-6">
             <button 
               onclick={handleContinueShopping}
               class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
             >
              ← Continue Shopping
            </button>
          </div>
        </div>
        
        <!-- Cart Summary -->
        <div class="lg:col-span-1">
           {#if CartSummary}
             <CartSummary
               subtotal={cartCalculations().subtotal}
               tax={cartCalculations().tax}
               total={cartCalculations().total}
               itemCount={cartCalculations().itemCount}
               isLoading={cartStore.state.isLoading}
               error={cartStore.state.error}
               on:checkout={handleCheckout}
             />
           {/if}
        </div>
      </div>
    {/if}
 </div>
</div>