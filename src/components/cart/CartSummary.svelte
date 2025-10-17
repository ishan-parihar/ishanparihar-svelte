<script lang="ts">
  import { cartStore } from '$lib/stores/cart';
  
  export let subtotal: number = 0;
  export let tax: number = 0;
  export let total: number = 0;
  export let itemCount: number = 0;
  export let isLoading: boolean = false;
  export let error: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  function handleCheckout() {
    dispatch('checkout');
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <p class="text-red-600 dark:text-red-40">{error}</p>
    </div>
  {/if}
  
  <div class="space-y-3">
    <div class="flex justify-between text-gray-600 dark:text-gray-300">
      <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
      <span>₹{subtotal.toLocaleString()}</span>
    </div>
    
    <div class="flex justify-between text-gray-600 dark:text-gray-300">
      <span>Tax (18%)</span>
      <span>₹{tax.toLocaleString()}</span>
    </div>
    
    <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
      <div class="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
        <span>Total</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  
  <button
    class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
    disabled={isLoading || total === 0}
    on:click={handleCheckout}
  >
    {#if isLoading}
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Processing...
      </div>
    {:else}
      Proceed to Checkout
    {/if}
 </button>
  
  <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
    <p>Secure payment processing</p>
    <p class="mt-1">Your information is protected with 256-bit SSL encryption</p>
  </div>
</div>