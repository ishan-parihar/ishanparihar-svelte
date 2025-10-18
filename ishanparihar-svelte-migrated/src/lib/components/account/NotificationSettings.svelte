<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User, NotificationSettings } from '$lib/types/user';
  
  export let user: User;
  
  const dispatch = createEventDispatcher();
  
  let settings: NotificationSettings = {
    email_notifications: user?.notification_preferences?.email ?? true,
    sms_notifications: user?.notification_preferences?.sms ?? false,
    push_notifications: user?.notification_preferences?.push ?? true,
    marketing_emails: user?.marketing_emails ?? false
  };
  
  let saving = false;
  let error: string | null = null;
  
  async function handleSave() {
    try {
      saving = true;
      error = null;
      
      // Dispatch update event with settings
      dispatch('update', settings);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSave} class="space-y-6">
    <!-- Email Notifications -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.email_notifications}
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
    
    <!-- SMS Notifications -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.sms_notifications}
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
    
    <!-- Push Notifications -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in your browser</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.push_notifications}
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-60 peer-checked:bg-blue-600"></div>
      </label>
    </div>
    
    <!-- Marketing Emails -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Receive promotional emails and offers</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.marketing_emails}
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-60 peer-checked:bg-blue-600"></div>
      </label>
    </div>
    
    <!-- Submit Button -->
    <div class="flex items-center justify-end pt-4">
      <button
        type="submit"
        disabled={saving}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  </form>
</div>