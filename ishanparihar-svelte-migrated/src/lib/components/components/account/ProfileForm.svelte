<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '$lib/types/user';
  
  export let user: User;
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  };
  
  let saving = false;
  let error: string | null = null;
  
  async function handleSubmit() {
    try {
      saving = true;
      error = null;
      
      // Dispatch update event with form data
      dispatch('update', formData);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Full Name
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder="Enter your full name"
      />
    </div>
    
    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        bind:value={formData.email}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder="Enter your email"
      />
    </div>
    
    <!-- Phone -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Phone Number
      </label>
      <input
        id="phone"
        type="tel"
        bind:value={formData.phone}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder="Enter your phone number"
      />
    </div>
    
    <!-- Bio -->
    <div>
      <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Bio
      </label>
      <textarea
        id="bio"
        bind:value={formData.bio}
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder="Tell us about yourself"
      ></textarea>
    </div>
    
    <!-- Submit Button -->
    <div class="flex items-center justify-end">
      <button
        type="submit"
        disabled={saving}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
</div>