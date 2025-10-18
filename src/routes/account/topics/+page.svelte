<script lang="ts">
  import { onMount } from 'svelte';
  
  let topics = $state([
    { id: 'integral-theory', name: 'Integral Theory', selected: false },
    { id: 'law-of-one', name: 'Law of One', selected: false },
    { id: 'personal-development', name: 'Personal Development', selected: false },
    { id: 'consciousness-studies', name: 'Consciousness Studies', selected: false },
    { id: 'spiritual-practice', name: 'Spiritual Practice', selected: false },
    { id: 'philosophy', name: 'Philosophy', selected: false },
    { id: 'psychology', name: 'Psychology', selected: false },
    { id: 'holistic-health', name: 'Holistic Health', selected: false },
    { id: 'transpersonal-psychology', name: 'Transpersonal Psychology', selected: false },
    { id: 'meditation', name: 'Meditation', selected: false },
    { id: 'mindfulness', name: 'Mindfulness', selected: false },
    { id: 'enlightenment', name: 'Enlightenment', selected: false },
    { id: 'awakening', name: 'Awakening', selected: false },
    { id: 'self-realization', name: 'Self-Realization', selected: false },
    { id: 'non-duality', name: 'Non-Duality', selected: false }
  ]);
  
  let loading = $state(true);
  let saving = $state(false);
  let error = $state(null);
  let success = $state(null);
  
  onMount(async () => {
    // In a real implementation, we would fetch user's selected topics from the API
    // For now, we'll simulate loading with some default selections
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, select some topics by default
      topics = topics.map(topic => ({
        ...topic,
        selected: ['integral-theory', 'personal-development', 'meditation'].includes(topic.id)
      }));
    } catch (err) {
      console.error('Failed to load topics:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  function toggleTopic(topicId: string) {
    topics = topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, selected: !topic.selected } 
        : topic
    );
  }
  
  async function saveTopics() {
    saving = true;
    error = null;
    success = null;
    
    try {
      // In a real implementation, we would send the selected topics to the API
      // For now, just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success = 'Your topic preferences have been saved successfully!';
    } catch (err) {
      console.error('Failed to save topics:', err);
      error = err.message;
    } finally {
      saving = false;
    }
  }
  
  const selectedTopics = $derived(topics.filter(topic => topic.selected));
  const unselectedTopics = $derived(topics.filter(topic => !topic.selected));
</script>

<svelte:head>
  <title>Topic Preferences - Account</title>
  <meta name="description" content="Manage your topic preferences and interests." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Topic Preferences</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select topics that interest you to personalize your content experience
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else}
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
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Your Selected Topics</h2>
          
          {#if selectedTopics.length === 0}
            <div class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No topics selected</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select topics below to customize your content experience.
              </p>
            </div>
          {:else}
            <div class="flex flex-wrap gap-2 mb-8">
              {#each selectedTopics as topic (topic.id)}
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {topic.name}
                  <button 
                    type="button" 
                    class="ml-2 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-200 focus:outline-none"
                    onclick={() => toggleTopic(topic.id)}
                  >
                    <span class="sr-only">Remove {topic.name}</span>
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </span>
              {/each}
            </div>
          {/if}
          
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Available Topics</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {#each unselectedTopics as topic (topic.id)}
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start">
                <button 
                  type="button"
                  class="h-5 w-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select {topic.name}"
                  onclick={() => toggleTopic(topic.id)}
                >
                  <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="ml-3 text-base font-medium text-gray-900 dark:text-white">{topic.name}</span>
              </div>
            {/each}
          </div>
          
          <div class="flex justify-between">
            <button
              type="button"
              class="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              onclick={() => {
                topics = topics.map(topic => ({ ...topic, selected: false }));
                success = null;
              }}
            >
              Clear All
            </button>
            <button
              type="button"
              class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              onclick={saveTopics}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Topic Categories Section -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Topic Categories</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Browse topics by category to find areas of interest
          </p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Spiritual Practices</h3>
              <ul class="space-y-2">
                {#each topics.filter(t => ['meditation', 'mindfulness', 'enlightenment'].includes(t.id)) as topic (topic.id)}
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    <span class="text-gray-700 dark:text-gray-300">{topic.name}</span>
                  </li>
                {/each}
              </ul>
            </div>
            
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Psychology & Consciousness</h3>
              <ul class="space-y-2">
                {#each topics.filter(t => ['psychology', 'consciousness-studies', 'transpersonal-psychology'].includes(t.id)) as topic (topic.id)}
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    <span class="text-gray-700 dark:text-gray-300">{topic.name}</span>
                  </li>
                {/each}
              </ul>
            </div>
            
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Philosophy & Frameworks</h3>
              <ul class="space-y-2">
                {#each topics.filter(t => ['integral-theory', 'law-of-one', 'philosophy'].includes(t.id)) as topic (topic.id)}
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    <span class="text-gray-700 dark:text-gray-300">{topic.name}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>