<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  interface Service {
    id: string;
    title: string;
    excerpt: string;
    price: number;
    category: string;
    status: 'active' | 'inactive';
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    sales: number;
  }
  
  interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  interface Filters {
    search: string;
    category: string;
    status: string;
  }
  
  let services = $state<Service[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let pagination = $state<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state<Filters>({
    search: '',
    category: 'all',
    status: 'all'
  });

  onMount(async () => {
    await loadServices();
  });

  async function loadServices() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      services = [
        {
          id: '1',
          title: 'Consultation Session',
          excerpt: 'Personalized consultation to understand your needs and goals',
          price: 5000,
          category: 'Consultation',
          status: 'active',
          featured: true,
          createdAt: '2023-01-15',
          updatedAt: '2023-05-20',
          sales: 12
        },
        {
          id: '2',
          title: 'Intensive Program',
          excerpt: 'Comprehensive program for deep transformation',
          price: 25000,
          category: 'Programs',
          status: 'active',
          featured: true,
          createdAt: '2023-02-20',
          updatedAt: '2023-05-18',
          sales: 8
        },
        {
          id: '3',
          title: 'Online Course',
          excerpt: 'Self-paced learning with expert guidance',
          price: 8000,
          category: 'Courses',
          status: 'inactive',
          featured: false,
          createdAt: '2023-03-10',
          updatedAt: '2023-04-05',
          sales: 3
        }
      ];
      
      pagination.total = services.length;
      pagination.totalPages = Math.ceil(services.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load services';
      console.error('Error loading services:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadServices();
  };

  const handlePageChange = (newPage: number) => {
    pagination.page = newPage;
    loadServices();
  };

  const editService = (serviceId: string) => {
    goto(`/admin/services/edit/${serviceId}`);
  };

  const createNewService = () => {
    goto('/admin/services/new');
  };

  const toggleServiceStatus = async (serviceId: string) => {
    loading = true;
    try {
      // Simulate API call to update service status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call
      const serviceIndex = services.findIndex(s => s.id === serviceId);
      if (serviceIndex !== -1) {
        services[serviceIndex] = {
          ...services[serviceIndex],
          status: services[serviceIndex].status === 'active' ? 'inactive' : 'active'
        };
      }
    } catch (err) {
      error = 'Failed to update service status';
      console.error('Error updating service status:', err);
    } finally {
      loading = false;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Services Management</h1>
      <p class="mt-1 text-sm text-gray-600">
        Manage services, pricing, and availability
      </p>
    </div>
    
     <Button onclick={createNewService}>
      Create New Service
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search services..."
          bind:value={filters.search}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          bind:value={filters.category}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="consultation">Consultation</option>
          <option value="programs">Programs</option>
          <option value="courses">Courses</option>
        </select>
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
          <option value="inactive">Inactive</option>
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
                Service
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each services as service (service.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{service.title}</div>
                  <div class="text-sm text-gray-500">{service.excerpt}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{service.price?.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(service.status)}`}>
                    {service.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.sales}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                     onclick={() => editService(service.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-green-600 hover:text-green-900 mr-3"
                     onclick={() => toggleServiceStatus(service.id)}
                  >
                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900"
                     onclick={() => console.log('Delete service:', service.id)}
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