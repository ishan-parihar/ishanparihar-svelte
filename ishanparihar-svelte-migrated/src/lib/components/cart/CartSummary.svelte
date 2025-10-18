<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { cartStore } from '$lib/stores/cart';
  
  const { onCheckout } = $props<{ onCheckout: () => void }>();
  
  const { state } = cartStore;
</script>

<div class="bg-gray-50 rounded-lg p-6">
  <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
  
  <div class="flow-root">
    <ul class="divide-y divide-gray-200">
       {#each state.items as item (item.service.id)}
         <li class="py-3 flex justify-between text-sm">
           <p class="font-medium text-gray-900">
             {item.service.title} x {item.quantity}
           </p>
           <p class="font-medium text-gray-900">
             ${item.service.price ? (item.service.price * item.quantity).toFixed(2) : '0.00'}
           </p>
         </li>
       {/each}
    </ul>
  </div>
  
  <div class="mt-6 space-y-3">
    <div class="flex justify-between text-base font-medium text-gray-900">
      <p>Subtotal</p>
      <p>${state.total.toFixed(2)}</p>
    </div>
    <div class="flex justify-between text-base font-medium text-gray-900">
      <p>Tax</p>
      <p>${(state.total * 0.1).toFixed(2)}</p>
    </div>
    <div class="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
      <p>Total</p>
      <p>${(state.total * 1.1).toFixed(2)}</p>
    </div>
  </div>
  
  <div class="mt-6">
    <Button 
      onclick={onCheckout}
      class="w-full justify-center"
      disabled={state.items.length === 0}
    >
      Checkout
    </Button>
  </div>
  
  <div class="mt-4 text-center">
    <p class="text-sm text-gray-500">
      Shipping and taxes calculated at checkout
    </p>
  </div>
</div>