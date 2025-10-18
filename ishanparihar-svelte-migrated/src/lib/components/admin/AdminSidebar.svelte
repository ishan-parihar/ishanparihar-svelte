<script lang="ts">
  import { page } from '$app/stores';
  import { PERMISSION_SCOPES } from '$lib/constants/permissions';
  import type { User } from '$lib/types/user';
  import type { NavigationItem } from '$lib/types/navigation';
  
  export let user: User | null;
  export let permissions: string[];
  export let currentPath: string;
  export let navigation: NavigationItem[];
  
  function hasPermission(permission: string): boolean {
    return permissions.includes(permission);
  }
  
  $: visibleNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );
</script>

<div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h2>
  </div>
  
  <nav class="flex-1 overflow-y-auto py-4">
    <ul class="space-y-1 px-2">
      {#each visibleNavigation as item}
        <li>
          <a 
            href={item.path}
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              {currentPath === item.path 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
          >
            <span class="ml-3">{item.name}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  {#if user}
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <img 
          src={user.picture || '/default-avatar.png'} 
          alt={user.name}
          class="w-8 h-8 rounded-full"
        />
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user.name}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>