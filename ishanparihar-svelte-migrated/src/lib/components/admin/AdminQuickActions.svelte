<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PERMISSION_SCOPES } from '$lib/constants/permissions';
  
  export let permissions: string[];
  
  const dispatch = createEventDispatcher();
  
  function hasPermission(permission: string): boolean {
    return permissions.includes(permission);
  }
  
  const quickActions = [
    {
      id: 'create-blog',
      title: 'Create Blog Post',
      description: 'Write a new blog article',
      icon: '📝',
      permission: PERMISSION_SCOPES.BLOG_CREATE,
      action: 'blog/new'
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: '👥',
      permission: PERMISSION_SCOPES.ADMIN_USERS,
      action: 'users'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check site performance metrics',
      icon: '📊',
      permission: PERMISSION_SCOPES.ADMIN_DASHBOARD,
      action: 'analytics'
    },
    {
      id: 'manage-services',
      title: 'Manage Services',
      description: 'Update service offerings',
      icon: '⚙️',
      permission: PERMISSION_SCOPES.SERVICES_EDIT,
      action: 'services'
    },
    {
      id: 'manage-comments',
      title: 'Moderate Comments',
      description: 'Review and approve comments',
      icon: '💬',
      permission: PERMISSION_SCOPES.BLOG_EDIT,
      action: 'comments'
    },
    {
      id: 'view-support',
      title: 'Support Tickets',
      description: 'Handle customer support requests',
      icon: '🎫',
      permission: PERMISSION_SCOPES.ADMIN_DASHBOARD,
      action: 'support'
    }
  ];
  
  $: visibleActions = quickActions.filter(action => 
    hasPermission(action.permission)
  );
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
      Quick Actions
    </h2>
  </div>
  
  <div class="grid grid-cols-1 gap-3">
    {#each visibleActions as action}
      <button 
        class="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
        on:click={() => dispatch('action', action.action)}
      >
        <span class="text-2xl">{action.icon}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 dark:text-white">
            {action.title}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {action.description}
          </p>
        </div>
      </button>
    {/each}
  </div>
</div>