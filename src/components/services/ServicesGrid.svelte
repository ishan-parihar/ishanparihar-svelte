<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ProductService } from '../../types/cart';
  
  let { services = [], loading = false, pagination = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  } } = $props<{ 
    services?: ProductService[]; 
    loading?: boolean; 
    pagination?: any;
  }>();
  
  const dispatch = createEventDispatcher();
  
  function handleServiceClick(service: any) {
    goto(`/services/${service.id}`);
  }
  
  function handlePageChange(page: number) {
    dispatch('pageChange', page);
  }
</script>

{#if loading}
  <div class="flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
{:else}
  {#if services.length > 0}
    <!-- Services Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each services as service}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div class="p-6">
            {#if service.featured}
              <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-3">
                Featured
              </div>
            {/if}
            
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">{service.excerpt}</p>
            
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-blue-60 dark:text-blue-400">
                ₹{service.base_price?.toLocaleString() || 'TBD'}
              </span>
              
              {#if service.category}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {service.category.name}
                </span>
              {/if}
            </div>
            
             <button
               class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
               onclick={() => handleServiceClick(service)}
             >
              View Details
            </button>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Pagination -->
    {#if pagination.totalPages > 1}
      <div class="mt-12 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Showing <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to 
          <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of 
          <span class="font-medium">{pagination.total}</span> results
        </div>
        
        <div class="flex space-x-2">
         <button
           class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
           disabled={pagination.page <= 1}
           onclick={() => handlePageChange(pagination.page - 1)}
         >
            Previous
          </button>
          
          {#each Array.from({ length: pagination.totalPages }, (_, i) => i + 1) as pageNum, index}
            {#if (
              pageNum === 1 || 
              pageNum === pagination.totalPages || 
              (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
            )}
               <button
                 class={`px-4 py-2 text-sm font-medium rounded-md ${
                   pageNum === pagination.page
                     ? 'bg-blue-600 text-white'
                     : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                 }`}
                 onclick={() => handlePageChange(pageNum)}
               >
                {pageNum}
              </button>
            {/if}
            {#if pageNum === 1 && pagination.page > 3}
              <span class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">...</span>
            {/if}
            {#if pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2}
              <span class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">...</span>
            {/if}
          {/each}
          
           <button
             class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
             disabled={pagination.page >= pagination.totalPages}
             onclick={() => handlePageChange(pagination.page + 1)}
           >
            Next
          </button>
        </div>
      </div>
    {/if}
  {/if}
{/if}