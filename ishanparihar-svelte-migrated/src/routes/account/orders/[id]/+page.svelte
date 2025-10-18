<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let order = $state<any>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const orderId = $page.params.id;
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch order');
      }
      
      const data = await response.json();
      order = data.order;
    } catch (err) {
      error = 'Failed to load order details';
      console.error('Error loading order:', err);
    } finally {
      loading = false;
    }
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const goBack = () => {
    goto('/account/orders');
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if error}
    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    {#if order}
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Order Details</h1>
        <Button variant="outline" onclick={goBack}>
          Back to Orders
        </Button>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Order #{order.order_number}
            </h3>
            <span class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        
        <div class="border-t border-gray-200">
          <!-- Order Items -->
          <div class="px-4 py-5 sm:p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
            <div class="space-y-4">
              {#each order.items as item (item.service_id)}
                <div class="flex justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <p class="font-medium text-gray-900">{item.service_title}</p>
                    <p class="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">₹{item.total_price}</p>
                    <p class="text-sm text-gray-500">₹{item.unit_price} × {item.quantity}</p>
                  </div>
                </div>
              {/each}
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex justify-between text-lg font-medium text-gray-900">
                <p>Total</p>
                <p>₹{order.total_amount}</p>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="px-4 py-5 sm:p-6 bg-gray-50">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Shipping Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Name</p>
                <p class="text-gray-900">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Email</p>
                <p class="text-gray-900">{order.shipping_address.email}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Phone</p>
                <p class="text-gray-900">{order.shipping_address.phone}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Address</p>
                <p class="text-gray-900">{order.shipping_address.address}</p>
                <p class="text-gray-900">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p class="text-gray-900">{order.shipping_address.country}</p>
              </div>
            </div>
          </div>

          <!-- Billing Address (if different) -->
          {#if order.billing_address && (order.billing_address.address !== order.shipping_address.address)}
            <div class="px-4 py-5 sm:p-6">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Billing Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Name</p>
                  <p class="text-gray-900">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Email</p>
                  <p class="text-gray-900">{order.billing_address.email}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Phone</p>
                  <p class="text-gray-900">{order.billing_address.phone}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Address</p>
                  <p class="text-gray-900">{order.billing_address.address}</p>
                  <p class="text-gray-900">{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip_code}</p>
                  <p class="text-gray-900">{order.billing_address.country}</p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Payment Information -->
          <div class="px-4 py-5 sm:p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Payment Status</p>
                <p class="text-gray-900">Paid</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Payment Method</p>
                <p class="text-gray-900">Credit/Debit Card (via Razorpay)</p>
              </div>
              {#if order.payment_id}
                <div>
                  <p class="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p class="text-gray-900 font-mono text-sm">{order.payment_id}</p>
                </div>
              {/if}
              <div>
                <p class="text-sm font-medium text-gray-500">Currency</p>
                <p class="text-gray-900">{order.currency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Order not found</h3>
        <p class="mt-1 text-gray-500">The order you're looking for doesn't exist or may have been removed.</p>
        <div class="mt-6">
          <Button onclick={goBack}>
            Back to Orders
          </Button>
        </div>
      </div>
    {/if}
  {/if}
</div>