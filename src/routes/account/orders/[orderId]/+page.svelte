<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  
  let order = $state(null);
  let loading = $state(true);
  let error = $state(null);
  
  let orderId = $derived($page.params.orderId);
  
  $effect(() => {
    if (orderId) {
      loadOrder();
    }
  });
  
  async function loadOrder() {
    if (!orderId) return;
    
    loading = true;
    error = null;
    
    try {
      const response = await apiClient.orders.getOrder(orderId);
      order = response;
    } catch (err) {
      console.error('Failed to load order:', err);
      error = err.message || 'Failed to load order';
    } finally {
      loading = false;
    }
  }
  
  $: if (orderId) {
    loadOrder();
  }

  async function loadOrder() {
    loading = true;
    error = null;
    
    try {
      const response = await apiClient.orders.getOrder(orderId);
      order = response;
    } catch (err) {
      console.error('Failed to load order:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
  
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
</script>

<svelte:head>
  <title>Order #{order?.order_number} - Account</title>
  <meta name="description" content="View details of your order #{order?.order_number}." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <a href="/account/orders" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Orders
      </a>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-4">Order Details</h1>
      {#if order}
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Order #{order.order_number} • Placed on {formatDate(order.created_at)}
        </p>
      {/if}
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else}
      {#if error}
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-red-800 dark:text-red-200">Order Not Found</h3>
          <p class="mt-2 text-red-600 dark:text-red-400">
            {error}
          </p>
          <div class="mt-6">
            <a href="/account/orders" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">
              View All Orders
            </a>
          </div>
        </div>
      {:else if order}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <!-- Order Summary Section -->
          <div class="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Order #{order.order_number}</h2>
                <p class="mt-1 text-gray-600 dark:text-gray-400">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div class="mt-4 md:mt-0">
                <span class={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                {#if order.shipping_address}
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                    {order.shipping_address.name}<br>
                    {order.shipping_address.street}<br>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}<br>
                    {order.shipping_address.country}
                  </p>
                {:else}
                  <p class="text-gray-500 dark:text-gray-500 text-sm">Not specified</p>
                {/if}
              </div>
              
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Billing Address</h3>
                {#if order.billing_address}
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                    {order.billing_address.name}<br>
                    {order.billing_address.street}<br>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.pincode}<br>
                    {order.billing_address.country}
                  </p>
                {:else}
                  <p class="text-gray-500 dark:text-gray-500 text-sm">Not specified</p>
                {/if}
              </div>
              
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Payment Details</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Status: {order.payment_status || 'Not specified'}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Amount: {formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>
          
          <!-- Order Items Section -->
          <div class="px-6 py-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  {#each order.items as item (item.id)}
                    <tr>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{item.service_title}</div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            
            <!-- Order Totals Section -->
            <div class="mt-8 flex justify-end">
              <div class="w-full max-w-md">
                <div class="flex justify-between text-base font-medium text-gray-900 dark:text-white py-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                
                {#if order.tax_amount && order.tax_amount > 0}
                  <div class="flex justify-between text-base text-gray-700 dark:text-gray-300 py-2">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                {/if}
                
                {#if order.shipping_amount && order.shipping_amount > 0}
                  <div class="flex justify-between text-base text-gray-700 dark:text-gray-300 py-2">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_amount)}</span>
                  </div>
                {/if}
                
                <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white py-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Actions Section -->
          <div class="px-6 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Need help with your order? Contact our support team.
                </p>
              </div>
              <div class="flex space-x-3">
                {#if order.status === 'pending' || order.status === 'processing'}
                  <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                    Cancel Order
                  </button>
                {/if}
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>