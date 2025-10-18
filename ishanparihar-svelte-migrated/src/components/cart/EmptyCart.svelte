<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const continueShopping = () => {
    goto('/services');
  };
</script>

<div class="text-center py-12">
  <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
    <svg 
      class="h-12 w-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
      />
    </svg>
  </div>
  
  <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
  <p class="mt-2 text-sm text-gray-500">
    Looks like you haven't added anything to your cart yet.
  </p>
  
  <div class="mt-8">
    <Button on:click={continueShopping}>
      Continue Shopping
    </Button>
  </div>
  
  <div class="mt-6">
    <a href="/" class="text-sm font-medium text-blue-600 hover:text-blue-500">
      &larr; Back to home
    </a>
  </div>
</div>