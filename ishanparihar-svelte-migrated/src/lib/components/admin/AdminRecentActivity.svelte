<script lang="ts">
  import type { AdminActivity } from '$lib/types/admin';
  
  export let activities: AdminActivity[] = [];
  export let isLoading = false;
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
      Recent Activity
    </h2>
    <a href="/admin/activity" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
      View all
    </a>
  </div>
  
  {#if isLoading}
    <div class="space-y-4">
      {#each Array(5) as _, i}
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1 w-3/4"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if activities.length === 0}
    <div class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each activities as activity}
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {activity.userInitials || activity.type[0].toUpperCase()}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 dark:text-white">
              {activity.description}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activity.timestamp}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>