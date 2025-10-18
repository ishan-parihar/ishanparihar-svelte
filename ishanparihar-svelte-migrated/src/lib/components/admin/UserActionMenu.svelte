<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MoreHorizontal } from 'lucide-svelte';
  
  import type { UserForTable } from '$lib/types/user';
  
  export let user: UserForTable;
  
  const dispatch = createEventDispatcher();
  let isOpen = false;
  
  function handleAction(action: string) {
    dispatch('action', action);
    isOpen = false;
  }
</script>

<div class="relative">
    <button 
      on:click={() => isOpen = !isOpen}
      class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
    <MoreHorizontal class="w-4 h-4 text-gray-500 dark:text-gray-400" />
  </button>
  
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div class="py-1">
        {#if user.role !== 'admin'}
          {#if user.suspended}
             <button 
                on:click={() => handleAction('unsuspend')}
                class="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-green-400"
              >
               Unsuspend User
             </button>
          {:else}
              <button 
                on:click={() => handleAction('suspend')}
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-red-400"
              >
               Suspend User
             </button>
          {/if}
          
          {#if user.role === 'user'}
              <button 
                on:click={() => handleAction('promote')}
                class="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-purple-400"
              >
               Promote to Admin
             </button>
          {:else if user.role === 'admin'}
              <button 
                on:click={() => handleAction('demote')}
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              >
               Demote to User
             </button>
          {/if}
        {/if}
        
          <button 
            on:click={() => handleAction('view')}
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
          >
           View Profile
         </button>
      </div>
    </div>
    
     <!-- Click outside to close -->
       <div 
         class="fixed inset-0 z-40" 
         on:click={() => isOpen = false}
         on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isOpen = false; }}
         role="button"
         tabindex="0"
       ></div>
  {/if}
</div>