<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import UserManagementTable from '$lib/components/admin/UserManagementTable.svelte';
  import UserFilters from '$lib/components/admin/UserFilters.svelte';
  import { apiClient } from '$lib/api/client';
  import type { UserForTable } from '$lib/types/user';
  
  let users = $state<UserForTable[]>([]);
  let loading = $state(true);
  let pagination = $state({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    search: '',
    status: 'all',
    role: 'all'
  });
  
  onMount(() => {
    loadUsers();
  });
  
  async function loadUsers() {
    try {
      loading = true;
      const response = await apiClient.admin.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      users = response.users;
      pagination = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      loading = false;
    }
  }
  
  function handleFilterChange(newFilters: Partial<typeof filters>) {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadUsers();
  }
  
  function handlePageChange(newPage: number) {
    pagination.page = newPage;
    loadUsers();
  }
  
  async function handleUserAction(action: string, user: UserForTable) {
    try {
      switch (action) {
        case 'suspend':
          await apiClient.admin.suspendUser(user.id, {
            suspend: true,
            reason: 'Administrative action'
          });
          break;
        case 'unsuspend':
          await apiClient.admin.suspendUser(user.id, {
            suspend: false
          });
          break;
        case 'promote':
          await apiClient.admin.updateUserRole(user.id, 'admin');
          break;
        case 'demote':
          await apiClient.admin.updateUserRole(user.id, 'user');
          break;
        case 'view':
          // TODO: Navigate to user details page
          console.log('View user:', user.id);
          break;
      }
      
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        User Management
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage user accounts and permissions
      </p>
    </div>
  </div>
  
  <!-- Filters -->
  <UserFilters 
    {filters}
    on:change={(e) => handleFilterChange(e.detail)}
  />
  
  <!-- Users Table -->
  <UserManagementTable 
    {users}
    {loading}
    {pagination}
    on:pageChange={(e) => handlePageChange(e.detail)}
    on:userAction={(e) => handleUserAction(e.detail.action, e.detail.user)}
  />
</div>