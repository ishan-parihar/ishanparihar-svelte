<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  
  let serviceData = $state({
    title: '',
    excerpt: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    image: ''
  });

  let loading = $state(false);
  let error = $state(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading = true;
    error = null;

    try {
      // Simulate API call to create service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating service:', serviceData);
      // In a real app, this would call an API endpoint
      // await apiClient.admin.services.createService(serviceData);

      // Redirect to services listing
      goto('/admin/services');
    } catch (err) {
      error = 'Failed to create service';
      console.error('Error creating service:', err);
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    goto('/admin/services');
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-center justify-between mb-6">
    <button 
      on:click={() => goto('/admin/services')}
      class="text-blue-600 hover:text-blue-500 font-medium flex items-center"
    >
      &larr; Back to Services Management
    </button>
  </div>

  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Create New Service</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Create a new service with details, pricing, and SEO settings
      </p>
    </div>
    
    <div class="px-4 py-5 sm:p-6">
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

      <form on:submit={handleSubmit}>
        <div class="grid grid-cols-1 gap-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              bind:value={serviceData.title}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter service title"
              required
            />
            <p class="mt-1 text-sm text-gray-500">The main title of your service</p>
          </div>

          <!-- Excerpt -->
          <div>
            <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              bind:value={serviceData.excerpt}
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the service"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">A short description that appears in service listings</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              bind:value={serviceData.description}
              rows="6"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the service..."
              required
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">Detailed information about the service</p>
          </div>

          <!-- Price -->
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                id="price"
                type="number"
                bind:value={serviceData.price}
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                required
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Price in INR</p>
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              bind:value={serviceData.category}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="consultation">Consultation</option>
              <option value="programs">Programs</option>
              <option value="courses">Courses</option>
              <option value="workshops">Workshops</option>
              <option value="other">Other</option>
            </select>
            <p class="mt-1 text-sm text-gray-500">Category for organizing services</p>
          </div>

          <!-- Image -->
          <div>
            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="image"
              type="text"
              bind:value={serviceData.image}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p class="mt-1 text-sm text-gray-500">URL to the service image</p>
          </div>

          <!-- SEO Section -->
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h4>
            
            <div class="space-y-4">
              <!-- Meta Title -->
              <div>
                <label for="metaTitle" class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  bind:value={serviceData.metaTitle}
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title for search engines"
                  maxlength="60"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Recommended: Keep it under 60 characters
                </p>
              </div>

              <!-- Meta Description -->
              <div>
                <label for="metaDescription" class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  bind:value={serviceData.metaDescription}
                  rows="3"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description for search engines"
                  maxlength="160"
                ></textarea>
                <p class="mt-1 text-sm text-gray-500">
                  Recommended: Keep it under 160 characters
                </p>
              </div>
            </div>
          </div>

          <!-- Publishing Options -->
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Publishing Options</h4>
            
            <div class="space-y-4">
              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div class="flex space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={serviceData.status}
                      value="active"
                      class="text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2">Active</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={serviceData.status}
                      value="inactive"
                      class="text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2">Inactive</span>
                  </label>
                </div>
              </div>

              <!-- Featured -->
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="featured"
                    type="checkbox"
                    bind:checked={serviceData.featured}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="featured" class="font-medium text-gray-700">
                    Featured Service
                  </label>
                  <p class="text-gray-500">
                    Check this to feature this service prominently on the site
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            on:click={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {#if loading}
              Creating...
            {:else}
              Create Service
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>