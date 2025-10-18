<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { cartStore } from '$lib/stores/cart';

  // Clear cart after successful order
  $effect(() => {
    // Clear cart after successful order completion
    cartStore.clearCart();
  });

  const continueShopping = () => {
    goto('/');
  };

  const viewOrder = () => {
    goto('/account/orders');
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="max-w-3xl mx-auto text-center">
    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
      <svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <h1 class="mt-4 text-3xl font-bold text-gray-900">Thank You for Your Order!</h1>
    
    <p class="mt-4 text-lg text-gray-600">
      Your order has been placed successfully. Please check your email for order confirmation and details.
    </p>
    
    <div class="mt-8 bg-white shadow rounded-lg p-6 text-left">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div class="space-y-4">
        <div class="flex justify-between">
          <span class="text-gray-600">Order Number</span>
          <span class="font-medium">#ORD-{Math.floor(Math.random() * 1000000)}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Order Date</span>
          <span class="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Total Amount</span>
          <span class="font-medium">₹{Math.floor(Math.random() * 10000) + 100}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Payment Status</span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Order Status</span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Processing
          </span>
        </div>
      </div>
    </div>
    
    <div class="mt-8">
      <p class="text-lg font-medium text-gray-900">What's next?</p>
      <p class="mt-2 text-gray-600">
        You'll receive an email confirmation shortly with your order details and tracking information.
      </p>
    </div>
    
    <div class="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <Button on:click={continueShopping}>
        Continue Shopping
      </Button>
      <Button variant="outline" on:click={viewOrder}>
        View Order History
      </Button>
    </div>
  </div>
</div>