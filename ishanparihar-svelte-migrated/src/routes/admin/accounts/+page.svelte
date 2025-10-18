<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { UserForTable } from '$lib/types/user';
  
  interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  interface Filters {
    search: string;
    status: string;
    role: string;
    dateRange: string;
  }
  
  let users = $state<UserForTable[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let pagination = $state<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state<Filters>({
    search: '',
    status: 'all',
    role: 'all',
    dateRange: 'all'
  });

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    try {
      loading = true;
      error = null;
      
       // Simulating API call - in real implementation, this would fetch from server
       users = [
         {
           id: '1',
           email: 'john@example.com',
           name: 'John Doe',
           fullName: 'John Doe',
           role: 'admin',
           status: 'active',
           created_at: '2023-01-15T10:30:00Z',
           updated_at: '2023-05-20T15:45:00Z',
           registrationDate: '2023-01-15',
           last_login: '2023-05-20T15:45:00Z',
           lastLogin: '2023-05-20',
           email_verified: true,
           orders: 12,
           totalSpent: 15000
         },
         {
           id: '2',
           email: 'jane@example.com',
           name: 'Jane Smith',
           fullName: 'Jane Smith',
           role: 'user',
           status: 'active',
           created_at: '2023-02-20T11:00:00Z',
           updated_at: '2023-05-18T14:30:00Z',
           registrationDate: '2023-02-20',
           last_login: '2023-05-18T14:30:00Z',
           lastLogin: '2023-05-18',
           email_verified: true,
           orders: 8,
           totalSpent: 8500
         },
         {
           id: '3',
           email: 'bob@example.com',
           name: 'Bob Johnson',
           fullName: 'Bob Johnson',
           role: 'user',
           status: 'suspended',
           created_at: '2023-03-10T09:15:00Z',
           updated_at: '2023-04-05T16:20:00Z',
           registrationDate: '2023-03-10',
           last_login: '2023-04-05T16:20:00Z',
           lastLogin: '2023-04-05',
           email_verified: true,
           orders: 3,
           totalSpent: 3200
         }
       ];
      
      pagination.total = users.length;
      pagination.totalPages = Math.ceil(users.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load users';
      console.error('Error loading users:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadUsers();
  };

  const handlePageChange = (newPage: number) => {
    pagination.page = newPage;
    loadUsers();
  };

  const viewUser = (userId: string) => {
    goto(`/admin/accounts/${userId}`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Account Management</h1>
      <p class="mt-1 text-sm text-gray-600">
        Manage user accounts, roles, and permissions
      </p>
    </div>
    
    <Button onclick={() => goto('/admin/users')}>
      View All Users
    </Button>
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
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search users..."
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          id="role"
          bind:value={filters.role}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      
      <div>
        <label for="date-range" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <select
          id="date-range"
          bind:value={filters.dateRange}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>
    
     <div class="flex justify-end mt-4">
       <Button onclick={() => handleFilterChange(filters)}>
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
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each users as user (user.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-700 font-medium">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div class="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.orders}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{user.totalSpent?.toLocaleString() || '0'}
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {new Date(user.last_login || user.lastLogin || '').toLocaleDateString()}
                 </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button
                     type="button"
                     class="text-blue-600 hover:text-blue-900 mr-3"
                     onclick={() => viewUser(user.id)}
                   >
                     Edit
                   </button>
                   <button
                     type="button"
                     class="text-red-600 hover:text-red-900"
                     onclick={() => console.log('Delete user:', user.id)}
                   >
                     Delete
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
           onclick={() => handlePageChange(pagination.page - 1)}
         >
           Previous
         </button>
         <button
           disabled={pagination.page >= pagination.totalPages}
           class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
           onclick={() => handlePageChange(pagination.page + 1)}
         >
           Next
         </button>
      </div>
    </div>
  {/if}
</div>