<script lang="ts">
  export let assessment: {
    id: number;
    title: string;
    description: string;
    slug: string;
    category: string;
    duration: number; // in minutes
    questions_count: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    featured: boolean;
    created_at: string;
  };
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
  <div class="p-6">
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        {assessment.title}
      </h3>
      {#if assessment.featured}
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Featured
        </span>
      {/if}
    </div>
    
    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
      {assessment.description}
    </p>
    
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {assessment.category}
      </span>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
      </span>
    </div>
    
    <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
      <span>{assessment.questions_count} questions</span>
      <span>{assessment.duration} min</span>
    </div>
  </div>
  
  <div class="bg-gray-50 dark:bg-gray-700 px-6 py-3">
    <a 
      href={`/assessments/${assessment.slug}`} 
      class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    >
      Start Assessment
      <svg class="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  </div>
</div>