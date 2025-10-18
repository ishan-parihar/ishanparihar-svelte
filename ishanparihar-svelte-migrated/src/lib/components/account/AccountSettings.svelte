<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User, PasswordChangeData } from '$lib/types/user';
  
  const { user = null } = $props<{
    user?: User | null;
  }>();
  
  // Intentionally unused prop for API consistency
  $effect(() => {
    // Using user prop to prevent unused export warning
    user;
  });
  
  const dispatch = createEventDispatcher();
  
  let passwordData = $state<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  let saving = $state(false);
  let error = $state<string | null>(null);
  
  async function handlePasswordChange(e: Event) {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error = 'New passwords do not match';
      return;
    }
    
    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      error = 'Password must be at least 8 characters long';
      return;
    }
    
    try {
      saving = true;
      error = null;
      
      // Dispatch password change event
      dispatch('passwordChange', passwordData);
      
      // Reset form
      passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (err) {
      error = (err as Error).message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h2>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {/if}
  
  <div class="space-y-8">
    <!-- Password Change -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
      
       <form onsubmit={handlePasswordChange} class="space-y-4">
        <!-- Current Password -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            bind:value={passwordData.currentPassword}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your current password"
          />
        </div>
        
        <!-- New Password -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            bind:value={passwordData.newPassword}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your new password"
          />
        </div>
        
        <!-- Confirm New Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={passwordData.confirmPassword}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Confirm your new password"
          />
        </div>
        
        <!-- Submit Button -->
        <div class="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-70 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Account Deletion -->
    <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Deletion</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Delete Account
      </button>
    </div>
  </div>
</div>