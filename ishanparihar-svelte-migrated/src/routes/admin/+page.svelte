<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AdminMetricsCards from '$lib/components/admin/AdminMetricsCards.svelte';
  import AdminRecentActivity from '$lib/components/admin/AdminRecentActivity.svelte';
  import AdminQuickActions from '$lib/components/admin/AdminQuickActions.svelte';
  import { apiClient } from '$lib/api/client';
  import type { AdminDashboardData } from '$lib/types/admin';
  import type { User } from '$lib/types/user';
  
  let { data } = $props<{ data: { user: User; permissions: string[] } }>();
  
  let dashboardData = $state<AdminDashboardData | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  
  let user = $derived(data.user);
  let permissions = $derived(data.permissions);
  
  onMount(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  });
  
  async function loadDashboardData() {
    try {
      isLoading = true;
      dashboardData = await apiClient.admin.getDashboard();
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
  
  function handleQuickAction(action: string) {
    goto(`/admin/${action}`);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Welcome back, {user.name}
      </p>
    </div>
    
  <button 
    onclick={loadDashboardData}
    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    disabled={isLoading}
  >
    {isLoading ? 'Refreshing...' : 'Refresh'}
  </button>
  </div>
  
  <!-- Metrics Cards -->
  {#if dashboardData}
    <AdminMetricsCards 
      metrics={dashboardData.metrics}
      {permissions}
    />
  {/if}
  
  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Activity -->
    <AdminRecentActivity 
      activities={dashboardData?.recentActivities || []}
      {isLoading}
    />
    
    <!-- Quick Actions -->
    <AdminQuickActions 
      {permissions}
      on:action={(e) => handleQuickAction(e.detail)}
    />
  </div>
  
  <!-- Error State -->
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {/if}
</div>