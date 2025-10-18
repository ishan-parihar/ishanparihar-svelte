<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  export let userId: string;
  
  interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }
  
  interface Order {
    id: string;
    created_at: string;
    status: string;
    total: number;
    items: OrderItem[];
  }
  
  let orders: Order[] = [];
  let loading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      orders = await apiClient.orders.getUserOrders(userId);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order History</h2>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-40">{error}</p>
    </div>
  {/if}
  
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if orders.length === 0}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        You haven't placed any orders yet.
      </p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-20 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Order
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-70">
          {#each orders as order (order.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
                   order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400' : 
                   order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-80/20 dark:text-red-400' : 
                   'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'}">
                  {order.status}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(order.total)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  View
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing <span class="font-medium">1</span> to <span class="font-medium">{orders.length}</span> of{' '}
        <span class="font-medium">{orders.length}</span> results
      </div>
      <div class="flex space-x-2">
        <button class="px-3 py-1 border border-gray-30 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
          Previous
        </button>
        <button class="px-3 py-1 border border-gray-30 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  {/if}
</div>