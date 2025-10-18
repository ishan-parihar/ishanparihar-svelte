<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let orders = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let metrics = $state({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    newCustomers: 0
  });
  let pagination = $state({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  onMount(async () => {
    await loadSalesData();
  });

  async function loadSalesData() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      orders = [
        {
          id: 'ORD-001',
          customer: 'John Smith',
          email: 'john@example.com',
          total: 8500,
          status: 'completed',
          date: '2023-05-15',
          items: 2
        },
        {
          id: 'ORD-002',
          customer: 'Sarah Johnson',
          email: 'sarah@example.com',
          total: 15000,
          status: 'completed',
          date: '2023-05-14',
          items: 1
        },
        {
          id: 'ORD-003',
          customer: 'Michael Brown',
          email: 'michael@example.com',
          total: 5200,
          status: 'pending',
          date: '2023-05-13',
          items: 1
        },
        {
          id: 'ORD-004',
          customer: 'Emily Davis',
          email: 'emily@example.com',
          total: 21000,
          status: 'completed',
          date: '2023-05-12',
          items: 3
        },
        {
          id: 'ORD-005',
          customer: 'Robert Wilson',
          email: 'robert@example.com',
          total: 3200,
          status: 'refunded',
          date: '2023-05-11',
          items: 1
        }
      ];
      
      // Calculate metrics
      metrics.totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      
      metrics.totalOrders = orders.length;
      metrics.avgOrderValue = Math.round(metrics.totalRevenue / orders.filter(o => o.status === 'completed').length) || 0;
      metrics.newCustomers = 3; // Placeholder
      
      pagination.total = orders.length;
      pagination.totalPages = Math.ceil(orders.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load sales data';
      console.error('Error loading sales data:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadSalesData();
  };

  const handlePageChange = (newPage) => {
    pagination.page = newPage;
    loadSalesData();
  };

  const viewOrder = (orderId) => {
    goto(`/admin/orders/${orderId}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
    <p class="mt-1 text-sm text-gray-600">
      Track orders, revenue, and sales performance
    </p>
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

  <!-- Metrics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Total Revenue</p>
          <p class="text-2xl font-semibold text-gray-900">₹{metrics.totalRevenue?.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Total Orders</p>
          <p class="text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-purple-100">
          <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Avg. Order Value</p>
          <p class="text-2xl font-semibold text-gray-900">₹{metrics.avgOrderValue?.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-yellow-100">
          <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">New Customers</p>
          <p class="text-2xl font-semibold text-gray-900">{metrics.newCustomers}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white shadow rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
        <input
          id="search"
          type="text"
          placeholder="Search by customer or order ID..."
          bind:value={filters.search}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          bind:value={filters.status}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div>
        <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <select
          id="dateRange"
          bind:value={filters.dateRange}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
    
    <div class="flex justify-end mt-4">
      <Button on:click={() => handleFilterChange(filters)}>
        Apply Filters
      </Button>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each orders as order (order.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{order.customer}</div>
                  <div class="text-sm text-gray-500">{order.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{order.total?.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900"
                    on:click={() => viewOrder(order.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to 
        <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of 
        <span class="font-medium">{pagination.total}</span> results
      </div>
      <div class="flex space-x-2">
        <button
          disabled={pagination.page <= 1}
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          on:click={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          disabled={pagination.page >= pagination.totalPages}
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          on:click={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>