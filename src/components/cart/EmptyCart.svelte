<script lang="ts">
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher();
  
  function handleContinueShopping() {
    dispatch('continueShopping');
  }
</script>

<div class="text-center py-12">
  <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
  </svg>
  
  <h3 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h3>
  <p class="mt-2 text-gray-500 dark:text-gray-400">
    You don't have any services in your cart yet.
  </p>
  
  <div class="mt-6">
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
      on:click={handleContinueShopping}
    >
      Browse Services
    </button>
  </div>
</div>