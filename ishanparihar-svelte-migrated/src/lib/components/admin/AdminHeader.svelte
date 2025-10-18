<script lang="ts">
  import { goto } from '$app/navigation';
  
  export let user;
  
  function handleLogout() {
    // TODO: Implement logout functionality
    goto('/api/logout');
  }
</script>

<header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
    </div>
    
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-3">
        <img 
          src={user.picture || '/default-avatar.png'} 
          alt={user.name}
          class="w-8 h-8 rounded-full"
        />
        <div class="hidden md:block">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {user.role}
          </p>
        </div>
      </div>
      
      <button 
        on:click={handleLogout}
        class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        Logout
      </button>
    </div>
  </div>
</header>