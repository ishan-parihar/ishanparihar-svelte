<script lang="ts">
  import { cartStore } from '$lib/stores/cart';
  
  export let item: any;
  
  const dispatch = createEventDispatcher();
  
 let quantity = $state(item.quantity);
  
  function handleQuantityChange() {
    dispatch('update', quantity);
  }
  
  function handleRemove() {
    dispatch('remove');
  }
  
  function incrementQuantity() {
    quantity += 1;
    handleQuantityChange();
  }
  
  function decrementQuantity() {
    if (quantity > 1) {
      quantity -= 1;
      handleQuantityChange();
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
  <div class="p-6">
    <div class="flex items-center">
      <!-- Service Image/Icon -->
      <div class="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
        <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      
      <!-- Service Details -->
      <div class="ml-4 flex-1">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{item.service.title}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.service.excerpt}</p>
        
        <div class="mt-2 flex items-center justify-between">
          <div class="text-lg font-semibold text-blue-60 dark:text-blue-400">
            ₹{(item.service.base_price * item.quantity).toLocaleString()}
          </div>
          
          <!-- Quantity Controls -->
          <div class="flex items-center">
            <button
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
              on:click={decrementQuantity}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            
            <span class="mx-2 text-gray-700 dark:text-gray-300">{quantity}</span>
            
            <button
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
              on:click={incrementQuantity}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            <button
              class="ml-4 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
              on:click={handleRemove}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>