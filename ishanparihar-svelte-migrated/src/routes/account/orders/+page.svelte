<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let orders = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      // In a real implementation, this would fetch orders from an API
      // For demo purposes, we'll use mock data
      orders = [
        {
          id: '1',
          order_number: 'ORD-001',
          status: 'completed',
          total_amount: 5000,
          currency: 'INR',
          created_at: new Date().toISOString(),
          items: [
            { service_title: 'Consultation Session', quantity: 1, unit_price: 5000 }
          ]
        },
        {
          id: '2',
          order_number: 'ORD-002',
          status: 'processing',
          total_amount: 25000,
          currency: 'INR',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          items: [
            { service_title: 'Intensive Program', quantity: 1, unit_price: 25000 }
          ]
        },
        {
          id: '3',
          order_number: 'ORD-003',
          status: 'shipped',
          total_amount: 8000,
          currency: 'INR',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          items: [
            { service_title: 'Online Course', quantity: 1, unit_price: 8000 }
          ]
        }
      ];
    } catch (err) {
      error = 'Failed to load orders';
      console.error('Error loading orders:', err);
    } finally {
      loading = false;
    }
  });

  const viewOrder = (orderId: string) => {
    goto(`/account/orders/${orderId}`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Order History</h1>
  </div>

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
    {#if orders.length === 0}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
        <p class="mt-1 text-gray-500">You haven't placed any orders yet.</p>
         <div class="mt-6">
           <Button onclick={() => goto('/services')}>
             Browse Services
           </Button>
         </div>
      </div>
    {:else}
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          {#each orders as order}
            <li>
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                     <p class="text-lg font-medium text-blue-600 truncate">
                       <button onclick={() => viewOrder(order.id)} class="hover:underline">
                         {order.order_number}
                       </button>
                     </p>
                    <div class="ml-2">
                      <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-medium text-gray-900">₹{order.total_amount.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      {#each order.items as item, i}
                        {i > 0 ? ', ' : ''}
                        {item.service_title}
                      {/each}
                    </p>
                  </div>
                   <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                     <Button variant="outline" size="sm" onclick={() => viewOrder(order.id)}>
                       View Details
                     </Button>
                   </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</div>