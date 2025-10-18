<script>
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let tickets = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let pagination = $state({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    status: 'all',
    priority: 'all',
    search: '',
    assignee: 'all'
  });

  onMount(async () => {
    await loadTickets();
  });

  async function loadTickets() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      tickets = [
        {
          id: 'TICK-001',
          subject: 'Payment not processed',
          customer: 'John Smith',
          email: 'john@example.com',
          priority: 'high',
          status: 'open',
          category: 'billing',
          createdAt: '2023-05-15',
          updatedAt: '2023-05-15',
          assignee: 'admin',
          messages: 3
        },
        {
          id: 'TICK-002',
          subject: 'Login issue',
          customer: 'Sarah Johnson',
          email: 'sarah@example.com',
          priority: 'medium',
          status: 'in-progress',
          category: 'technical',
          createdAt: '2023-05-14',
          updatedAt: '2023-05-15',
          assignee: 'support-agent',
          messages: 5
        },
        {
          id: 'TICK-003',
          subject: 'Feature request',
          customer: 'Michael Brown',
          email: 'michael@example.com',
          priority: 'low',
          status: 'resolved',
          category: 'feature',
          createdAt: '2023-05-13',
          updatedAt: '2023-05-14',
          assignee: 'admin',
          messages: 2
        },
        {
          id: 'TICK-004',
          subject: 'Content issue',
          customer: 'Emily Davis',
          email: 'emily@example.com',
          priority: 'medium',
          status: 'open',
          category: 'content',
          createdAt: '2023-05-12',
          updatedAt: '2023-05-12',
          assignee: null,
          messages: 1
        },
        {
          id: 'TICK-005',
          subject: 'Account suspension',
          customer: 'Robert Wilson',
          email: 'robert@example.com',
          priority: 'high',
          status: 'closed',
          category: 'account',
          createdAt: '2023-05-11',
          updatedAt: '2023-05-11',
          assignee: 'admin',
          messages: 7
        }
      ];
      
      pagination.total = tickets.length;
      pagination.totalPages = Math.ceil(tickets.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load support tickets';
      console.error('Error loading tickets:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadTickets();
  };

  const handlePageChange = (newPage) => {
    pagination.page = newPage;
    loadTickets();
  };

  const viewTicket = (ticketId) => {
    goto(`/admin/support/tickets/${ticketId}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Support Dashboard</h1>
    <p class="mt-1 text-sm text-gray-600">
      Manage support tickets and customer inquiries
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

  <!-- Filters -->
  <div class="bg-white shadow rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Tickets</label>
        <input
          id="search"
          type="text"
          placeholder="Search by customer or subject..."
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
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          id="priority"
          bind:value={filters.priority}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div>
        <label for="assignee" class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
        <select
          id="assignee"
          bind:value={filters.assignee}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Assignees</option>
          <option value="admin">Admin</option>
          <option value="support-agent">Support Agent</option>
          <option value="unassigned">Unassigned</option>
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
                Ticket ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each tickets as ticket (ticket.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ticket.id}
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{ticket.subject}</div>
                  <div class="text-sm text-gray-500">Category: {ticket.category}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{ticket.customer}</div>
                  <div class="text-sm text-gray-500">{ticket.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.messages}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900"
                    on:click={() => viewTicket(ticket.id)}
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