<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let assessment = $state<any>(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  
  // Access params from the page store
  let slug = $state<string | undefined>(undefined);
  
   $effect(() => {
     const unsubscribe = page.subscribe(($page) => {
       const paramSlug = $page.params.slug;
       if (paramSlug) {
         slug = paramSlug;
       }
     });
     return unsubscribe;
   });
   
   const startAssessment = async () => {
     if (slug) {
       try {
         // Navigate to the assessment taking page
         await goto(`/assessments/${slug}/take`);
       } catch (err) {
         console.error('Failed to start assessment:', err);
         error = 'Failed to start assessment. Please try again.';
       }
     }
   };
</script>

<svelte:head>
  <title>{assessment?.title || 'Assessment'}</title>
  <meta name="description" content={assessment?.description || 'Take our comprehensive assessment to understand yourself better'} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{error}</p>
    </div>
  {:else if assessment}
    <div class="mb-8">
      <div class="flex items-center text-sm text-gray-500 mb-2">
        <a href="/assessments" class="text-blue-600 hover:text-blue-800">Assessments</a>
        <span class="mx-2">/</span>
        <span>{assessment.category}</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900">{assessment.title}</h1>
      <p class="text-gray-600 mt-2">{assessment.description}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mb-6">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{assessment.questions_count}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Questions</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{assessment.duration}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Level</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{assessment.category}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Category</div>
          </div>
        </div>
        
        <div class="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p>{assessment.content}</p>
          <h3>What You'll Learn</h3>
          <ul>
            <li>Your core personality traits</li>
            <li>How you interact with others</li>
            <li>Your decision-making patterns</li>
            <li>Areas for personal growth</li>
          </ul>
          <h3>How It Works</h3>
          <p>This assessment consists of multiple-choice questions designed to reveal patterns in your thinking, feeling, and behaving. Answer each question based on how you typically respond in real-life situations.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            onclick={startAssessment}
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Assessment
          </button>
          <button
            onclick={() => goto('/assessments')}
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    </div>
    
    <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <h3 class="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Before You Begin</h3>
      <ul class="text-blue-700 dark:text-blue-300 space-y-1">
        <li>• Find a quiet space where you won't be interrupted</li>
        <li>• Answer questions honestly, not how you wish you were</li>
        <li>• Take your time, but don't overthink each question</li>
        <li>• Your results will be saved to your account</li>
      </ul>
    </div>
  {/if}
</div>