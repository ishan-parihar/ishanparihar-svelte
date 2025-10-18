<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  interface Project {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    status: 'published' | 'draft' | 'archived';
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;
    likes: number;
  }
  
  interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  interface Filters {
    search: string;
    status: string;
    category: string;
  }
  
  let projects = $state<Project[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let pagination = $state<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state<Filters>({
    search: '',
    status: 'all',
    category: 'all'
  });

  onMount(async () => {
    await loadProjects();
  });

  async function loadProjects() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      projects = [
        {
          id: '1',
          title: 'Mindfulness Mastery',
          excerpt: 'A comprehensive program on mindfulness and meditation techniques',
          category: 'Programs',
          status: 'published',
          featured: true,
          createdAt: '2023-01-15',
          updatedAt: '2023-05-20',
          views: 1250,
          likes: 89
        },
        {
          id: '2',
          title: 'Leadership Excellence',
          excerpt: 'Developing leadership skills for personal and professional growth',
          category: 'Courses',
          status: 'published',
          featured: true,
          createdAt: '2023-02-20',
          updatedAt: '2023-05-18',
          views: 2100,
          likes: 134
        },
        {
          id: '3',
          title: 'Emotional Wellness',
          excerpt: 'Understanding and managing emotions for better well-being',
          category: 'Workshops',
          status: 'draft',
          featured: false,
          createdAt: '2023-03-10',
          updatedAt: '2023-04-05',
          views: 450,
          likes: 23
        }
      ];
      
      pagination.total = projects.length;
      pagination.totalPages = Math.ceil(projects.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load projects';
      console.error('Error loading projects:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadProjects();
  };

  const handlePageChange = (newPage: number) => {
    pagination.page = newPage;
    loadProjects();
  };

  const editProject = (projectId: string) => {
    goto(`/admin/projects/edit/${projectId}`);
  };

  const createNewProject = () => {
    goto('/admin/projects/new');
  };

  const toggleProjectStatus = async (projectId: string) => {
    loading = true;
    try {
      // Simulate API call to update project status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          status: projects[projectIndex].status === 'published' ? 'draft' : 'published'
        };
      }
    } catch (err) {
      error = 'Failed to update project status';
      console.error('Error updating project status:', err);
    } finally {
      loading = false;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Projects Management</h1>
      <p class="mt-1 text-sm text-gray-600">
        Manage projects, content, and publication status
      </p>
    </div>
    
    <Button on:click={createNewProject}>
      Create New Project
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search projects..."
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
          <option value="programs">Programs</option>
          <option value="courses">Courses</option>
          <option value="workshops">Workshops</option>
          <option value="books">Books</option>
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
                Project
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Likes
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each projects as project (project.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{project.title}</div>
                  <div class="text-sm text-gray-500">{project.excerpt}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.views}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.likes}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    on:click={() => editProject(project.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-green-600 hover:text-green-900 mr-3"
                    on:click={() => toggleProjectStatus(project.id)}
                  >
                    {project.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900"
                    on:click={() => console.log('Delete project:', project.id)}
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