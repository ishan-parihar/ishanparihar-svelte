<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  
  function continueShopping() {
    goto('/services');
  }
</script>

<div class="text-center py-12">
  <svg 
    class="mx-auto h-16 w-16 text-gray-400" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
    />
  </svg>
  <h3 class="mt-2 text-xl font-medium text-gray-900">Your cart is empty</h3>
  <p class="mt-1 text-gray-500">Looks like you haven't added anything to your cart yet</p>
  <div class="mt-6">
    <Button onclick={continueShopping} variant="outline">
      Continue Shopping
    </Button>
  </div>
</div>