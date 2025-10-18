<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { UserForTable } from '$lib/types/user';
  
  let userId = $state('');
  
  $effect(() => {
    const unsubscribe = page.subscribe((p) => {
      userId = p.params.userId;
    });
    return unsubscribe;
  });

  let loading = $state(false);
  let error = $state<string | null>(null);
  let isEditing = $state(false);
  let editData = $state<UserForTable>({ ...user });

  onMount(() => {
    // In real app, this would fetch user data from server
    editData = { ...user };
  });

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel edit
      editData = { ...user };
    }
    isEditing = !isEditing;
  };

  const saveUser = async () => {
    loading = true;
    error = null;
    
    try {
      // Simulate API call to save user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      user = { ...editData };
      isEditing = false;
    } catch (err) {
      error = 'Failed to update user';
      console.error('Error updating user:', err);
    } finally {
      loading = false;
    }
  };

  const updateUserStatus = async (newStatus: string) => {
    loading = true;
    error = null;
    
    try {
      // Simulate API call to update user status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      user.status = newStatus;
      editData.status = newStatus;
    } catch (err) {
      error = `Failed to ${newStatus === 'suspended' ? 'suspend' : 'activate'} user`;
      console.error('Error updating user status:', err);
    } finally {
      loading = false;
    }
  };

  const changeUserRole = async (newRole: string) => {
    loading = true;
    error = null;
    
    try {
      // Simulate API call to update user role
      await new Promise(resolve => setTimeout(resolve, 500));
      
      user.role = newRole;
      editData.role = newRole;
    } catch (err) {
      error = `Failed to update user role`;
      console.error('Error updating user role:', err);
    } finally {
      loading = false;
    }
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-center justify-between mb-6">
     <button 
       onclick={() => goto('/admin/accounts')}
       class="text-blue-600 hover:text-blue-500 font-medium flex items-center"
     >
       &larr; Back to Accounts
     </button>
    
    <div class="flex space-x-3">
      {#if isEditing}
         <Button variant="outline" onclick={toggleEdit} disabled={loading}>
           Cancel
         </Button>
         <Button onclick={saveUser} disabled={loading}>
           {#if loading}
             Saving...
           {:else}
             Save Changes
           {/if}
         </Button>
      {:else}
         <Button onclick={toggleEdit}>
           Edit Profile
         </Button>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
       <h3 class="text-lg leading-6 font-medium text-gray-900">User Information</h3>
       <p class="mt-1 max-w-2xl text-sm text-gray-500">Details and status for user {user.name || user.fullName}</p>
    </div>
    
    <div class="px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="sm:col-span-1">
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
           {#if isEditing}
             <input
               id="fullName"
               type="text"
               bind:value={editData.name}
               class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
           {:else}
             <p class="mt-1 text-sm text-gray-900">{user.name || user.fullName}</p>
           {/if}
        </div>
        
        <div class="sm:col-span-1">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          {#if isEditing}
            <input
              id="email"
              type="email"
              bind:value={editData.email}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          {:else}
            <p class="mt-1 text-sm text-gray-900">{user.email}</p>
          {/if}
        </div>
        
        <div class="sm:col-span-1">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          {#if isEditing}
            <input
              id="phone"
              type="tel"
              bind:value={editData.phone}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          {:else}
            <p class="mt-1 text-sm text-gray-900">{user.phone}</p>
          {/if}
        </div>
        
        <div class="sm:col-span-1">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          {#if isEditing}
            <select
              id="role"
              bind:value={editData.role}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          {:else}
            <p class="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
          {/if}
        </div>
        
        <div class="sm:col-span-2">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
           {#if isEditing}
             <input
               id="address"
               bind:value={editData.address}
               class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
           {:else}
             <p class="mt-1 text-sm text-gray-900">{user.address}</p>
           {/if}
        </div>
      </div>
    </div>
    
    <!-- Status and Actions -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">Account Status</h4>
          <div class="flex items-center space-x-2">
            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.status === 'active' ? 'bg-green-100 text-green-800' : 
              user.status === 'suspended' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {user.status}
            </span>
            
            {#if !isEditing}
              <div class="flex space-x-2">
                {#if user.status === 'active'}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onclick={() => updateUserStatus('suspended')}
                     disabled={loading}
                   >
                     Suspend
                   </Button>
                {:else}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onclick={() => updateUserStatus('active')}
                     disabled={loading}
                   >
                     Activate
                   </Button>
                {/if}
              </div>
            {/if}
          </div>
        </div>
        
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">User Role</h4>
          <div class="flex items-center space-x-2">
            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role}
            </span>
            
            {#if !isEditing}
              <div class="flex space-x-2">
                {#if user.role === 'admin'}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onclick={() => changeUserRole('user')}
                     disabled={loading}
                   >
                     Demote to User
                   </Button>
                {:else}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onclick={() => changeUserRole('admin')}
                     disabled={loading}
                   >
                     Promote to Admin
                   </Button>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Account Statistics</h4>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="bg-gray-50 p-4 rounded-md">
          <p class="text-sm font-medium text-gray-500">Total Orders</p>
          <p class="text-2xl font-bold text-gray-900">{user.orders}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-md">
          <p class="text-sm font-medium text-gray-500">Total Spent</p>
          <p class="text-2xl font-bold text-gray-900">₹{user.totalSpent?.toLocaleString()}</p>
        </div>
         <div class="bg-gray-50 p-4 rounded-md">
           <p class="text-sm font-medium text-gray-500">Registration Date</p>
           <p class="text-2xl font-bold text-gray-900">{new Date(user.registrationDate || user.created_at || '').toLocaleDateString()}</p>
         </div>
      </div>
    </div>
    
    <!-- Activity History -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
      <div class="flow-root">
        <ul class="-mb-8">
          <li>
            <div class="relative pb-8">
              <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                   <p class="text-sm text-gray-500">Last login</p>
                   <p class="text-sm text-gray-900">{new Date(user.last_login || user.lastLogin || '').toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div class="relative pb-8">
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                    <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                     <p class="text-sm text-gray-500">Account created</p>
                     <p class="text-sm text-gray-900">{new Date(user.registrationDate || user.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>