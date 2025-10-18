<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let concepts = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let pagination = $state({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all'
  });

  onMount(async () => {
    await loadConcepts();
  });

  async function loadConcepts() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      concepts = [
        {
          id: '1',
          title: 'Mindfulness',
          description: 'Practice of maintaining a non-judgmental awareness of the present moment',
          category: 'Mindfulness',
          type: 'concept',
          status: 'published',
          difficulty: 'beginner',
          createdAt: '2023-01-15',
          updatedAt: '2023-05-20',
          views: 1250,
          likes: 89
        },
        {
          id: '2',
          title: 'Emotional Intelligence',
          description: 'Ability to understand and manage emotions effectively',
          category: 'Emotional Wellness',
          type: 'concept',
          status: 'published',
          difficulty: 'intermediate',
          createdAt: '2023-02-20',
          updatedAt: '2023-05-18',
          views: 2100,
          likes: 134
        },
        {
          id: '3',
          title: 'Stress Management',
          description: 'Techniques to manage and reduce stress levels',
          category: 'Wellness',
          type: 'concept',
          status: 'draft',
          difficulty: 'beginner',
          createdAt: '2023-03-10',
          updatedAt: '2023-04-05',
          views: 450,
          likes: 23
        },
        {
          id: '4',
          title: 'Personality Assessment',
          description: 'Comprehensive assessment of personality traits',
          category: 'Assessment',
          type: 'assessment',
          status: 'published',
          difficulty: 'intermediate',
          createdAt: '2023-04-15',
          updatedAt: '2023-04-20',
          views: 890,
          likes: 67
        },
        {
          id: '5',
          title: 'Leadership Style Quiz',
          description: 'Discover your leadership style and strengths',
          category: 'Assessment',
          type: 'assessment',
          status: 'published',
          difficulty: 'beginner',
          createdAt: '2023-05-01',
          updatedAt: '2023-05-02',
          views: 1560,
          likes: 92
        }
      ];
      
      pagination.total = concepts.length;
      pagination.totalPages = Math.ceil(concepts.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load concepts';
      console.error('Error loading concepts:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadConcepts();
  };

  const handlePageChange = (newPage) => {
    pagination.page = newPage;
    loadConcepts();
  };

  const editConcept = (conceptId) => {
    goto(`/admin/concepts/edit/${conceptId}`);
  };

  const createNewConcept = () => {
    goto('/admin/concepts/new');
  };

  const toggleConceptStatus = async (conceptId) => {
    loading = true;
    try {
      // Simulate API call to update concept status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call
      const concept = concepts.find(c => c.id === conceptId);
      if (concept) {
        concept.status = concept.status === 'published' ? 'draft' : 'published';
      }
    } catch (err) {
      error = 'Failed to update concept status';
      console.error('Error updating concept status:', err);
    } finally {
      loading = false;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'concept': return 'bg-blue-100 text-blue-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Concepts & Assessments</h1>
      <p class="mt-1 text-sm text-gray-600">
        Manage educational concepts and assessment tools
      </p>
    </div>
    
    <Button on:click={createNewConcept}>
      Create New Item
    </Button>
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

  <!-- Filters -->
  <div class="bg-white shadow rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search concepts..."
          bind:value={filters.search}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          bind:value={filters.category}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="mindfulness">Mindfulness</option>
          <option value="wellness">Wellness</option>
          <option value="emotional">Emotional Wellness</option>
          <option value="assessment">Assessment</option>
        </select>
      </div>
      
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          id="type"
          bind:value={filters.type}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="concept">Concept</option>
          <option value="assessment">Assessment</option>
        </select>
      </div>
      
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          bind:value={filters.status}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
    
    <div class="flex justify-end mt-4">
      <Button on:click={() => handleFilterChange(filters)}>
        Apply Filters
      </Button>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each concepts as concept (concept.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{concept.title}</div>
                  <div class="text-sm text-gray-500 mt-1">{concept.description}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {concept.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(concept.type)}`}>
                    {concept.type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyClass(concept.difficulty)}`}>
                    {concept.difficulty}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(concept.status)}`}>
                    {concept.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {concept.views}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    on:click={() => editConcept(concept.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-green-600 hover:text-green-900 mr-3"
                    on:click={() => toggleConceptStatus(concept.id)}
                  >
                    {concept.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900"
                    on:click={() => console.log('Delete concept:', concept.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to 
        <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of 
        <span class="font-medium">{pagination.total}</span> results
      </div>
      <div class="flex space-x-2">
        <button
          disabled={pagination.page <= 1}
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          on:click={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          disabled={pagination.page >= pagination.totalPages}
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          on:click={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>