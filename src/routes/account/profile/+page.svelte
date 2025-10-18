<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  let user = $state({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar: ''
  });
  
  let loading = $state(true);
  let saving = $state(false);
  let error = $state(null);
  let success = $state(null);
  
  onMount(async () => {
    try {
      // Get user profile from API
      const userData = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!userData.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const result = await userData.json();
      user = {
        name: result.name || '',
        email: result.email || '',
        phone: result.phone || '',
        bio: result.bio || '',
        location: result.location || '',
        website: result.website || '',
        avatar: result.avatar || ''
      };
    } catch (err) {
      console.error('Failed to load profile:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function updateProfile() {
    saving = true;
    error = null;
    success = null;
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      success = 'Profile updated successfully!';
    } catch (err) {
      console.error('Failed to update profile:', err);
      error = err.message;
    } finally {
      saving = false;
    }
  }
  
  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      // In a real implementation, we would upload the file
      // For now, just show a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        user.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<svelte:head>
  <title>Account Profile - Settings</title>
  <meta name="description" content="Manage your account profile and settings." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Manage your personal information and preferences
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <!-- Profile Header -->
        <div class="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              {#if user.avatar}
                <img class="h-20 w-20 rounded-full object-cover" src={user.avatar} />
              {:else}
                <div class="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-2xl font-bold text-gray-500 dark:text-gray-400">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              {/if}
            </div>
            <div class="ml-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Profile Picture</h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                This will be displayed on your profile and in emails.
              </p>
              <div class="mt-4">
                <label class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Change Picture
                  <input type="file" class="hidden" accept="image/*" onchange={handleFileUpload} />
                </label>
                {#if user.avatar}
                  <button 
                    class="ml-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                    onclick={() => user.avatar = ''}
                  >
                    Remove
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Profile Form -->
        <div class="p-6">
          {#if error}
            <div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p class="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          {/if}
          
          {#if success}
            <div class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p class="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          {/if}
          
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.name}
              />
            </div>
            
            <div class="sm:col-span-3">
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.email}
                disabled
              />
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your email cannot be changed. Contact support if you need to update it.
              </p>
            </div>
            
            <div class="sm:col-span-3">
              <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.phone}
              />
            </div>
            
            <div class="sm:col-span-3">
              <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.location}
              />
            </div>
            
            <div class="sm:col-span-6">
              <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows="4"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.bio}
                placeholder="Tell us about yourself..."
              ></textarea>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Brief description for your profile. Links are okay.
              </p>
            </div>
            
            <div class="sm:col-span-6">
              <label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                bind:value={user.website}
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
            <button
              type="button"
              class="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              class="ml-3 bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              onclick={updateProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Security Section -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update your password and secure your account
          </p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div class="sm:col-span-3">
              <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div class="sm:col-span-3">
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
            <button
              type="button"
              class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
      
      <!-- Subscriptions Section -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Subscriptions & Communication</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your subscription preferences
          </p>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="email-marketing"
                  type="checkbox"
                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="email-marketing" class="font-medium text-gray-700 dark:text-gray-300">
                  Marketing emails
                </label>
                <p class="text-gray-500 dark:text-gray-400">
                  Receive updates about new features and services.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="email-security"
                  type="checkbox"
                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="email-security" class="font-medium text-gray-700 dark:text-gray-300">
                  Security alerts
                </label>
                <p class="text-gray-500 dark:text-gray-400">
                  Receive alerts about suspicious activity on your account.
                </p>
              </div>
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
            <button
              type="button"
              class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>