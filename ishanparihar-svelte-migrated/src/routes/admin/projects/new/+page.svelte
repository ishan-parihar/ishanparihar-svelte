<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  interface Project {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    status: string;
    featured: boolean;
    tags: string[];
    imageUrl: string;
  }

  let project = $state<Project>({
    title: '',
    excerpt: '',
    content: '',
    category: 'programs',
    status: 'draft',
    featured: false,
    tags: [],
    imageUrl: ''
  });
  
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = null;
    success = null;

    try {
      // Simulate API call to create project
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating project:', project);
      // In real implementation, this would be an API call
      // await apiClient.admin.projects.createProject(project);
      
      success = 'Project created successfully!';
      setTimeout(() => {
        goto('/admin/projects');
      }, 1500);
    } catch (err) {
      error = 'Failed to create project. Please try again.';
      console.error('Error creating project:', err);
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    goto('/admin/projects');
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    project = { ...project, [field]: value };
  };

  const handleToggleFeatured = () => {
    project.featured = !project.featured;
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Create New Project</h1>
    <p class="mt-1 text-sm text-gray-600">
      Create a new project for your platform
    </p>
  </div>

  <form onsubmit={handleSubmit} class="bg-white shadow rounded-lg p-6">
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

    {#if success}
      <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{success}</p>
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <Input
            id="title"
            type="text"
            placeholder="Enter project title"
            bind:value={project.title}
            required
          />
        </div>

        <div>
          <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <Textarea
            id="excerpt"
            placeholder="Brief description of the project"
            rows="3"
            bind:value={project.excerpt}
          />
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <Textarea
            id="content"
            placeholder="Full content of the project"
            rows="10"
            bind:value={project.content}
          />
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
         <div>
           <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
           <select
             id="category"
             bind:value={project.category}
             class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="programs">Programs</option>
             <option value="courses">Courses</option>
             <option value="workshops">Workshops</option>
             <option value="books">Books</option>
             <option value="articles">Articles</option>
           </select>
         </div>

         <div>
           <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
           <select
             id="status"
             bind:value={project.status}
             class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="draft">Draft</option>
             <option value="published">Published</option>
             <option value="archived">Archived</option>
           </select>
         </div>

        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            bind:value={project.imageUrl}
          />
        </div>

        <div class="flex items-center">
          <input
            id="featured"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={project.featured}
             onchange={handleToggleFeatured}
          />
          <label for="featured" class="ml-2 block text-sm text-gray-900">
            Featured Project
          </label>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3">
       <Button
         type="button"
         variant="outline"
         onclick={handleCancel}
         disabled={loading}
       >
         Cancel
       </Button>
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </div>
  </form>
</div>