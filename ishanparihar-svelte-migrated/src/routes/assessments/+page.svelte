<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  import AssessmentCard from '$lib/components/assessments/AssessmentCard.svelte';
  
  let assessments = $state<any[]>([]);
  let categories = $state<string[]>([]);
  let selectedCategory = $state('all');
  let searchQuery = $state('');
  let loading = $state(true);
  let error: string | null = $state(null);
  
  onMount(async () => {
    try {
      // In a real app, this would be apiClient.assessments.getAll()
      // For now, using mock data
      assessments = [
        {
          id: 1,
          title: "Personality Assessment",
          description: "Discover your core personality traits and characteristics.",
          slug: "personality-assessment",
          category: "Psychology",
          duration: 20,
          questions_count: 30,
          difficulty: "intermediate",
          featured: true,
          created_at: "2023-05-15T10:00:00Z"
        },
        {
          id: 2,
          title: "Mindfulness Quiz",
          description: "Evaluate your mindfulness practices and awareness levels.",
          slug: "mindfulness-quiz",
          category: "Wellness",
          duration: 15,
          questions_count: 25,
          difficulty: "beginner",
          featured: false,
          created_at: "2023-06-20T14:30:00Z"
        },
        {
          id: 3,
          title: "Life Purpose Discovery",
          description: "Explore your core values and life direction.",
          slug: "life-purpose-discovery",
          category: "Development",
          duration: 25,
          questions_count: 35,
          difficulty: "advanced",
          featured: true,
          created_at: "2023-07-10T09:15:00Z"
        },
        {
          id: 4,
          title: "Stress Management",
          description: "Assess your stress levels and coping mechanisms.",
          slug: "stress-management",
          category: "Wellness",
          duration: 12,
          questions_count: 20,
          difficulty: "intermediate",
          featured: false,
          created_at: "2023-07-25T11:00:00Z"
        },
        {
          id: 5,
          title: "Emotional Intelligence",
          description: "Measure your emotional awareness and regulation skills.",
          slug: "emotional-intelligence",
          category: "Psychology",
          duration: 18,
          questions_count: 28,
          difficulty: "intermediate",
          featured: true,
          created_at: "2023-08-05T16:30:00Z"
        },
        {
          id: 6,
          title: "Career Alignment",
          description: "Find your ideal career path based on strengths and values.",
          slug: "career-alignment",
          category: "Development",
          duration: 22,
          questions_count: 32,
          difficulty: "advanced",
          featured: false,
          created_at: "2023-08-15T13:45:00Z"
        }
      ];
      
      // Extract unique categories
      const uniqueCategories = [...new Set(assessments.map(a => a.category))];
      categories = ['all', ...uniqueCategories];
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
  
  function filteredAssessments() {
    return assessments.filter(assessment => {
      const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory;
      const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }
</script>

<svelte:head>
  <title>Assessments</title>
  <meta name="description" content="Take our comprehensive assessments to understand yourself better" />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Self-Discovery Assessments</h1>
    <p class="text-gray-600 mt-2">Explore our collection of assessments to gain insights about yourself</p>
  </div>
  
  <!-- Filters -->
  <div class="mb-8 flex flex-col md:flex-row gap-4">
    <div class="flex-1">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search assessments..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <div>
      <select
        bind:value={selectedCategory}
        class="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? 'All Categories' : category}
          </option>
        {/each}
      </select>
    </div>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{error}</p>
    </div>
  {:else}
    {#if filteredAssessments().length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredAssessments() as assessment (assessment.id)}
          <AssessmentCard assessment={assessment} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500">No assessments found matching your criteria.</p>
      </div>
    {/if}
  {/if}
</div>