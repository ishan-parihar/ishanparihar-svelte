<script>
  import { cartStore } from '$lib/stores/cart';
  import { Button } from '$lib/components/ui/Button.svelte';
  import { browser } from '$app/environment';

  let { onCheckout }: { onCheckout: () => void } = $props();
  let couponCode = $state('');
  let isApplyingCoupon = $state(false);
  let couponError = $state<string | null>(null);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      couponError = 'Please enter a coupon code';
      return;
    }

    isApplyingCoupon = true;
    couponError = null;

    try {
      // TODO: Implement actual coupon validation logic
      // For now, we'll just show a success message for demonstration
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      if (couponCode.toUpperCase() === 'SAVE10') {
        // Apply 10% discount - this would normally be handled by backend
        console.log('Coupon applied successfully');
      } else {
        couponError = 'Invalid coupon code';
      }
    } catch (error) {
      couponError = 'Failed to apply coupon';
      console.error('Coupon application error:', error);
    } finally {
      isApplyingCoupon = false;
    }
  };

  const checkout = () => {
    if (browser) {
      onCheckout();
    }
  };
</script>

<div class="bg-gray-50 p-6 rounded-lg">
  <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
  
  <div class="space-y-2">
    <div class="flex justify-between">
      <span>Subtotal</span>
      <span class="font-medium">₹{$cartStore.state.subtotal.toFixed(2)}</span>
    </div>
    
    <div class="flex justify-between">
      <span>Tax (18%)</span>
      <span class="font-medium">₹{($cartStore.state.subtotal * 0.18).toFixed(2)}</span>
    </div>
    
    <div class="flex justify-between">
      <span>Shipping</span>
      <span class="font-medium">Free</span>
    </div>
    
    <div class="border-t border-gray-200 pt-2 mt-2">
      <div class="flex justify-between text-lg font-medium">
        <span>Total</span>
        <span>₹{$cartStore.state.total.toFixed(2)}</span>
      </div>
    </div>
  </div>
  
  <!-- Coupon Code Section -->
  <div class="mt-6">
    <label for="coupon-code" class="block text-sm font-medium text-gray-700 mb-2">
      Coupon Code
    </label>
    <div class="flex space-x-2">
      <input
        id="coupon-code"
        type="text"
        bind:value={couponCode}
        placeholder="Enter coupon code"
        class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button 
        type="button" 
        variant="outline"
        on:click={applyCoupon}
        disabled={isApplyingCoupon}
      >
        {#if isApplyingCoupon}
          Applying...
        {:else}
          Apply
        {/if}
      </Button>
    </div>
    {#if couponError}
      <p class="mt-1 text-sm text-red-600">{couponError}</p>
    {/if}
  </div>
  
  <!-- Checkout Button -->
  <Button 
    class="w-full mt-6 py-3 text-base" 
    on:click={checkout}
    disabled={$cartStore.state.items.length === 0 || $cartStore.state.isLoading}
  >
    {#if $cartStore.state.isLoading}
      Processing...
    {:else}
      Proceed to Checkout
    {/if}
  </Button>
  
  <p class="mt-4 text-center text-sm text-gray-500">
    Shipping and taxes calculated at checkout
  </p>
</div>