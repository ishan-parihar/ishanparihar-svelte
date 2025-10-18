<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  import ProfileForm from '$lib/components/account/ProfileForm.svelte';
  import AccountSettings from '$lib/components/account/AccountSettings.svelte';
  import OrderHistory from '$lib/components/account/OrderHistory.svelte';
  import NotificationSettings from '$lib/components/account/NotificationSettings.svelte';
  
  import type { User } from '$lib/types/user';

  let user = $state<User | null>(null);
  let loading = $state(true);
  let activeTab = $state('profile');
  let error = $state<string | null>(null);
  let currentPageUrl = $state('');
  
  $effect(() => {
    currentPageUrl = $page.url.href;
  });
  
  onMount(async () => {
    try {
      user = await apiClient.user.getProfile();
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function handleProfileUpdate(profileData: any) {
    try {
      const updatedUser = await apiClient.user.updateProfile(profileData);
      user = updatedUser;
    } catch (err: any) {
      error = err.message;
    }
  }
  
  async function handlePasswordChange(passwordData: any) {
    try {
      await apiClient.user.changePassword(passwordData);
      // Show success message
    } catch (err: any) {
      error = err.message;
    }
 }
  
  async function handleNotificationSettings(settings: any) {
    try {
      await apiClient.user.updateNotificationSettings(settings);
      user = { ...user, ...settings };
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

<svelte:head>
  <title>My Account</title>
  <meta name="description" content="Manage your account settings and preferences." />
  {@html `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "My Account",
      "description": "Manage your account settings and preferences",
      "url": "${currentPageUrl}"
    }
    </script>
  `}
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        My Account
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage your profile, settings, and preferences
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-red-600 dark:text-red-400">{error}</p>
      </div>
    {:else if user}
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          {#each ['profile', 'settings', 'notifications', 'orders'] as tab}
            <button 
              onclick={() => activeTab = tab}
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {
                activeTab === tab 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-40' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          {/each}
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="mt-8">
        {#if activeTab === 'profile'}
          <ProfileForm 
            user={user}
            on:update={(e) => handleProfileUpdate(e.detail)}
          />
        {:else if activeTab === 'settings'}
          <AccountSettings 
            user={user}
            on:passwordChange={(e) => handlePasswordChange(e.detail)}
          />
        {:else if activeTab === 'notifications'}
          <NotificationSettings 
            user={user}
            on:update={(e) => handleNotificationSettings(e.detail)}
          />
        {:else if activeTab === 'orders'}
          <OrderHistory userId={user.id} />
        {/if}
      </div>
    {/if}
  </div>
</div>