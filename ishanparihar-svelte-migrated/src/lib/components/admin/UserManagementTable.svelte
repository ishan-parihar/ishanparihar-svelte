<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import UserActionMenu from './UserActionMenu.svelte';
  import UserStatusBadge from './UserStatusBadge.svelte';
  
  export let users = [];
  export let loading = false;
  export let pagination;
  
  const dispatch = createEventDispatcher();
</script>

<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Name
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Role
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Joined
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {#if loading}
          <tr>
            <td colspan="5" class="px-6 py-4 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </td>
          </tr>
        {:else if users.length === 0}
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No users found
            </td>
          </tr>
        {:else}
          {#each users as user}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <img 
                    src={user.picture || '/default-avatar.png'} 
                    alt={user.name}
                    class="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if user.role === 'admin'}
                  <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                    Admin
                  </span>
                {:else}
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded-full">
                    User
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UserStatusBadge 
                  suspended={user.suspended}
                  isFlagged={user.is_spam_flagged}
                  emailVerified={user.email_verified}
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UserActionMenu 
                  user={user}
                  on:action={(e) => dispatch('userAction', { action: e.detail, user })}
                />
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  <!-- Pagination -->
  {#if pagination && pagination.totalPages > 1}
    <div class="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          on:click={() => dispatch('pageChange', pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          Previous
        </button>
        
        <span class="text-sm text-gray-700 dark:text-gray-300">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        
        <button 
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          on:click={() => dispatch('pageChange', pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>