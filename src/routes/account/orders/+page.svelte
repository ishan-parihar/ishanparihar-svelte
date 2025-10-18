<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  let orders = $state([]);
  let loading = $state(true);
 let error = $state(null);
  
 onMount(async () => {
    try {
      const response = await apiClient.orders.getOrders();
      orders = response.orders || [];
    } catch (err) {
      console.error('Failed to load orders:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function getStatusClass(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
</script>

<svelte:head>
  <title>My Orders - Account</title>
  <meta name="description" content="View and manage your order history." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        View and manage your order history
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else}
      {#if orders.length === 0}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            You haven't placed any orders yet.
          </p>
          <div class="mt-6">
            <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">
              Browse Services
            </a>
          </div>
        </div>
      {:else}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each orders as order}
              <li>
                <div class="px-6 py-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Order #{order.order_number}</h3>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span class={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div class="mt-4">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">Order Items</h4>
                    <ul class="mt-2 space-y-2">
                      {#each order.order_items as item}
                        <li class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>{item.service_title} × {item.quantity}</span>
                          <span>₹{item.total_price.toLocaleString()}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                  
                  <div class="mt-4 flex items-center justify-between">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      Total: <span class="font-medium text-gray-900 dark:text-white">₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/if}
 </div>
</div>