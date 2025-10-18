<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { Input } from '$lib/components/ui/Input.svelte';
  import { Textarea } from '$lib/components/ui/Textarea.svelte';
  import { onMount } from 'svelte';
  
  let categories = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let isCreating = $state(false);
  let newCategory = $state({
    name: '',
    description: '',
    slug: '',
    active: true
  });
  
  let editingCategory = $state(null);
  let editingValues = $state({});

  onMount(async () => {
    await loadCategories();
  });

  async function loadCategories() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      categories = [
        {
          id: '1',
          name: 'Consultation',
          description: 'One-on-one consultation sessions',
          slug: 'consultation',
          active: true,
          createdAt: '2023-01-15',
          updatedAt: '2023-05-20',
          serviceCount: 5
        },
        {
          id: '2',
          name: 'Programs',
          description: 'Comprehensive programs for deep transformation',
          slug: 'programs',
          active: true,
          createdAt: '2023-02-20',
          updatedAt: '2023-05-18',
          serviceCount: 8
        },
        {
          id: '3',
          name: 'Courses',
          description: 'Self-paced learning courses',
          slug: 'courses',
          active: true,
          createdAt: '2023-03-10',
          updatedAt: '2023-04-05',
          serviceCount: 12
        },
        {
          id: '4',
          name: 'Workshops',
          description: 'Interactive workshop sessions',
          slug: 'workshops',
          active: false,
          createdAt: '2023-04-01',
          updatedAt: '2023-04-01',
          serviceCount: 3
        }
      ];
    } catch (err) {
      error = 'Failed to load categories';
      console.error('Error loading categories:', err);
    } finally {
      loading = false;
    }
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    loading = true;
    error = null;

    try {
      // Simulate API call to create category
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCat = {
        id: (categories.length + 1).toString(),
        ...newCategory,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        serviceCount: 0
      };
      
      categories = [...categories, newCat];
      
      // Reset form
      newCategory = {
        name: '',
        description: '',
        slug: '',
        active: true
      };
    } catch (err) {
      error = 'Failed to create category. Please try again.';
      console.error('Error creating category:', err);
    } finally {
      loading = false;
    }
  };

  const handleEditCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      editingCategory = categoryId;
      editingValues = { ...category };
    }
  };

  const handleSaveCategory = async () => {
    loading = true;
    error = null;

    try {
      // Simulate API call to update category
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      categories = categories.map(cat => 
        cat.id === editingCategory ? { ...editingValues } : cat
      );
      
      editingCategory = null;
      editingValues = {};
    } catch (err) {
      error = 'Failed to update category. Please try again.';
      console.error('Error updating category:', err);
    } finally {
      loading = false;
    }
  };

  const handleCancelEdit = () => {
    editingCategory = null;
    editingValues = {};
  };

  const handleDeleteCategory = async (categoryId) => {
    if (confirm('Are you sure you want to delete this category? Services in this category will not be deleted.')) {
      loading = true;
      error = null;

      try {
        // Simulate API call to delete category
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        categories = categories.filter(cat => cat.id !== categoryId);
      } catch (err) {
        error = 'Failed to delete category. Please try again.';
        console.error('Error deleting category:', err);
      } finally {
        loading = false;
      }
    }
  };

  const toggleCategoryStatus = (categoryId) => {
    categories = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, active: !cat.active, updatedAt: new Date().toISOString().split('T')[0] } 
        : cat
    );
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name) => {
    newCategory.name = name;
    newCategory.slug = generateSlug(name);
  };

  $effect(() => {
    if (editingCategory && editingValues.name) {
      editingValues.slug = generateSlug(editingValues.name);
    }
  });
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Services Categories</h1>
    <p class="mt-1 text-sm text-gray-600">
      Manage service categories and organize your offerings
    </p>
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

  <!-- Create Category Form -->
  <div class="bg-white shadow rounded-lg p-6 mb-8">
    <h2 class="text-lg font-medium text-gray-900 mb-4">
      {#if editingCategory}
        Edit Category
      {:else}
        Create New Category
      {/if}
    </h2>
    
    <form on:submit={editingCategory ? handleSaveCategory : handleCreateCategory}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <Input
            id="name"
            type="text"
            placeholder="Enter category name"
            bind:value={editingCategory ? editingValues.name : newCategory.name}
            on:input={(e) => editingCategory ? null : handleNameChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <Input
            id="slug"
            type="text"
            placeholder="category-slug"
            bind:value={editingCategory ? editingValues.slug : newCategory.slug}
            required
          />
        </div>

        <div class="md:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            id="description"
            placeholder="Brief description of the category"
            rows="3"
            bind:value={editingCategory ? editingValues.description : newCategory.description}
          />
        </div>

        <div class="flex items-center">
          <input
            id="active"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={editingCategory ? editingValues.active : newCategory.active}
            on:change={() => editingCategory ? editingValues.active = !editingValues.active : newCategory.active = !newCategory.active}
          />
          <label for="active" class="ml-2 block text-sm text-gray-900">
            Active Category
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        {#if editingCategory}
          <Button
            type="button"
            variant="outline"
            on:click={handleCancelEdit}
            disabled={loading}
          >
            Cancel
          </Button>
        {/if}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading 
            ? (editingCategory ? 'Updating...' : 'Creating...') 
            : (editingCategory ? 'Update Category' : 'Create Category')}
        </Button>
      </div>
    </form>
  </div>

  {#if loading && !isCreating}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        {#each categories as category (category.id)}
          <li class="hover:bg-gray-50">
            <div class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">{category.name}</div>
                  <span class={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-500">{category.serviceCount} services</span>
                  <button
                    type="button"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    on:click={() => handleEditCategory(category.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-green-600 hover:text-green-900 text-sm font-medium"
                    on:click={() => toggleCategoryStatus(category.id)}
                  >
                    {category.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                    on:click={() => handleDeleteCategory(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div class="mt-2">
                <p class="text-sm text-gray-500">{category.description}</p>
                <div class="mt-2 flex items-center text-xs text-gray-500">
                  <span>Slug: {category.slug}</span>
                  <span class="mx-2">•</span>
                  <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                  <span class="mx-2">•</span>
                  <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>