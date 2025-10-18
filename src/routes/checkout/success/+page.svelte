<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  
  let orderId = $state('');
  let orderDetails = $state(null);
  let loading = $state(true);
  let error = $state(null);
  
  onMount(async () => {
    const urlParams = new URLSearchParams($page.url.search);
    orderId = urlParams.get('order_id') || '';
    
    if (orderId) {
      try {
        // In a real implementation, we would fetch actual order details
        // For now, we'll simulate with mock data
        orderDetails = {
          id: orderId,
          order_number: `ORD-${Date.now()}-123`,
          total_amount: 4500,
          status: 'completed',
          created_at: new Date().toISOString(),
          order_items: [
            { service_title: 'AI Consulting', quantity: 1, total_price: 1500 },
            { service_title: 'Machine Learning Development', quantity: 1, total_price: 3000 }
          ],
          customer_name: 'John Doe',
          customer_email: 'john@example.com'
        };
      } catch (err) {
        console.error('Failed to load order details:', err);
        error = err.message;
      } finally {
        loading = false;
      }
    } else {
      loading = false;
      error = 'Order ID not provided';
    }
  });
  
  function handleContinueShopping() {
    goto('/services');
  }
  
  function handleViewOrder() {
    goto(`/account/orders`);
  }
</script>

<svelte:head>
  <title>Order Confirmation</title>
  <meta name="description" content="Your order has been confirmed successfully." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-8">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Thank You!</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Your order has been confirmed successfully.
      </p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
        <p class="text-gray-600 dark:text-gray-400">Order ID: {orderDetails?.id}</p>
      </div>
      
      <div class="space-y-4">
        {#each orderDetails?.items as item}
          <div class="flex justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
            </div>
            <p class="text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
          </div>
        {/each}
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div class="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>₹{orderDetails?.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">What's next?</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300"
          on:click={handleContinueShopping}
        >
          Continue Shopping
        </button>
        <button
          class="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-medium py-3 px-4 rounded-md transition-colors duration-300"
          on:click={handleViewOrder}
        >
          View Order Details
        </button>
      </div>
    </div>
  </div>
</div>