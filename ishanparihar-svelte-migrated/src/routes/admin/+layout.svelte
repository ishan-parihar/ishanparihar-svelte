<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
  import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
  import { adminNavigation } from '$lib/config/admin-navigation';
  
  export let data;
  
  $: currentPath = $page.url.pathname;
  $: user = data.user;
  $: permissions = data.permissions;
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900">
  <AdminSidebar 
    {user} 
    {permissions}
    navigation={adminNavigation}
    currentPath={currentPath}
  />
  
  <div class="flex-1 flex flex-col overflow-hidden">
    <AdminHeader {user} />
    
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <slot />
    </main>
  </div>
</div>