<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let filters;
  
  const dispatch = createEventDispatcher();
  
  function handleFilterChange() {
    dispatch('change', filters);
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Search
      </label>
      <input
        type="text"
        id="search"
        bind:value={filters.search}
        on:input={handleFilterChange}
        placeholder="Search by name or email..."
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
    
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        id="status"
        bind:value={filters.status}
        on:change={handleFilterChange}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="flagged">Flagged</option>
        <option value="unverified">Unverified</option>
      </select>
    </div>
    
    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Role
      </label>
      <select
        id="role"
        bind:value={filters.role}
        on:change={handleFilterChange}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  </div>
</div>