<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { Input } from '$lib/components/ui/Input.svelte';
  import { onMount } from 'svelte';
  
  let images = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let isUploading = $state(false);
  let uploadProgress = $state(0);
  let selectedImage = $state(null);
  let viewMode = $state('grid'); // 'grid' or 'list'
  let filters = $state({
    search: '',
    category: 'all',
    type: 'all'
  });

  onMount(async () => {
    await loadImages();
  });

  async function loadImages() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      images = [
        {
          id: '1',
          name: 'mindfulness-meditation.jpg',
          url: '/images/mindfulness-meditation.jpg',
          thumbnail: '/images/mindfulness-meditation-thumb.jpg',
          size: '2.4 MB',
          type: 'image/jpeg',
          category: 'blog',
          tags: ['mindfulness', 'meditation', 'wellness'],
          uploadedAt: '2023-05-15',
          uploadedBy: 'admin',
          dimensions: '1920x1080',
          altText: 'Person meditating in nature'
        },
        {
          id: '2',
          name: 'personal-growth-workshop.jpg',
          url: '/images/personal-growth-workshop.jpg',
          thumbnail: '/images/personal-growth-workshop-thumb.jpg',
          size: '1.8 MB',
          type: 'image/jpeg',
          category: 'workshop',
          tags: ['workshop', 'growth', 'development'],
          uploadedAt: '2023-05-14',
          uploadedBy: 'admin',
          dimensions: '1920x1080',
          altText: 'Group of people in personal growth workshop'
        },
        {
          id: '3',
          name: 'emotional-intelligence-chart.png',
          url: '/images/emotional-intelligence-chart.png',
          thumbnail: '/images/emotional-intelligence-chart-thumb.png',
          size: '856 KB',
          type: 'image/png',
          category: 'infographic',
          tags: ['emotional', 'intelligence', 'chart'],
          uploadedAt: '2023-05-13',
          uploadedBy: 'admin',
          dimensions: '1200x800',
          altText: 'Emotional intelligence chart'
        },
        {
          id: '4',
          name: 'leadership-qualities.jpg',
          url: '/images/leadership-qualities.jpg',
          thumbnail: '/images/leadership-qualities-thumb.jpg',
          size: '2.1 MB',
          type: 'image/jpeg',
          category: 'blog',
          tags: ['leadership', 'qualities', 'management'],
          uploadedAt: '2023-05-12',
          uploadedBy: 'admin',
          dimensions: '1920x1080',
          altText: 'Leadership qualities visual'
        },
        {
          id: '5',
          name: 'wellness-tips-icon.svg',
          url: '/images/wellness-tips-icon.svg',
          thumbnail: '/images/wellness-tips-icon-thumb.svg',
          size: '45 KB',
          type: 'image/svg+xml',
          category: 'icon',
          tags: ['wellness', 'icon', 'tips'],
          uploadedAt: '2023-05-11',
          uploadedBy: 'admin',
          dimensions: '512x512',
          altText: 'Wellness tips icon'
        }
      ];
    } catch (err) {
      error = 'Failed to load images';
      console.error('Error loading images:', err);
    } finally {
      loading = false;
    }
  }

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      isUploading = true;
      uploadProgress = 0;
      
      // Simulate file upload progress
      const interval = setInterval(() => {
        if (uploadProgress < 100) {
          uploadProgress += 10;
        } else {
          clearInterval(interval);
          isUploading = false;
          uploadProgress = 0;
          
          // Simulate adding the new image to the list
          const newImage = {
            id: (images.length + 1).toString(),
            name: file.name,
            url: `/images/${file.name}`,
            thumbnail: `/images/${file.name}`,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            type: file.type,
            category: 'uncategorized',
            tags: [],
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: 'admin',
            dimensions: 'N/A',
            altText: ''
          };
          
          images = [newImage, ...images];
        }
      }, 200);
    }
  };

  const handleFilterChange = (newFilters) => {
    filters = { ...filters, ...newFilters };
  };

  const deleteImage = async (imageId) => {
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      loading = true;
      try {
        // Simulate API call to delete image
        await new Promise(resolve => setTimeout(resolve, 500));
        
        images = images.filter(img => img.id !== imageId);
      } catch (err) {
        error = 'Failed to delete image';
        console.error('Error deleting image:', err);
      } finally {
        loading = false;
      }
    }
  };

  const selectImage = (image) => {
    selectedImage = image;
  };

  const handleViewModeChange = (mode) => {
    viewMode = mode;
  };

  $: filteredImages = images.filter(img => {
    const matchesSearch = !filters.search || 
      img.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      img.altText.toLowerCase().includes(filters.search.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesCategory = filters.category === 'all' || img.category === filters.category;
    const matchesType = filters.type === 'all' || img.type.includes(filters.type);
    
    return matchesSearch && matchesCategory && matchesType;
  });
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Image Manager</h1>
    <p class="mt-1 text-sm text-gray-600">
      Upload, organize, and manage your media files
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

  <!-- Upload Area and Filters -->
  <div class="bg-white shadow rounded-lg p-6 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div class="flex items-center space-x-4">
        <label class="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <input 
            type="file" 
            class="hidden" 
            accept="image/*"
            on:change={handleFileUpload}
          />
          {#if isUploading}
            Uploading... {uploadProgress}%
          {:else}
            Upload Image
          {/if}
        </label>
        
        <div class="text-sm text-gray-600">
          {images.length} images
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          class={`px-3 py-1 rounded-md text-sm font-medium ${
            viewMode === 'grid' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          on:click={() => handleViewModeChange('grid')}
        >
          Grid
        </button>
        <button
          class={`px-3 py-1 rounded-md text-sm font-medium ${
            viewMode === 'list' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          on:click={() => handleViewModeChange('list')}
        >
          List
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Images</label>
        <Input
          id="search"
          type="text"
          placeholder="Search by name, alt text, or tags..."
          bind:value={filters.search}
          class="w-full"
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
          <option value="blog">Blog</option>
          <option value="workshop">Workshop</option>
          <option value="infographic">Infographic</option>
          <option value="icon">Icon</option>
          <option value="uncategorized">Uncategorized</option>
        </select>
      </div>
      
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">File Type</label>
        <select
          id="type"
          bind:value={filters.type}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
          <option value="gif">GIF</option>
        </select>
      </div>
    </div>
  </div>

  {#if loading && !isUploading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else if viewMode === 'grid'}
    <!-- Grid View -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {#each filteredImages as image (image.id)}
        <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
          <div class="p-4">
            <div class="aspect-w-16 aspect-h-9 mb-4">
              <img 
                src={image.thumbnail || image.url} 
                alt={image.altText || image.name}
                class="w-full h-48 object-cover rounded-md"
                on:click={() => selectImage(image)}
              />
            </div>
            
            <div class="mb-2">
              <h3 class="text-sm font-medium text-gray-900 truncate">{image.name}</h3>
              <p class="text-xs text-gray-500">{image.size} • {image.dimensions}</p>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {new Date(image.uploadedAt).toLocaleDateString()}
              </div>
              
              <div class="flex space-x-2">
                <button
                  type="button"
                  class="text-blue-600 hover:text-blue-900 text-xs"
                  on:click={() => selectImage(image)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-900 text-xs"
                  on:click={() => deleteImage(image.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- List View -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        {#each filteredImages as image (image.id)}
          <li class="hover:bg-gray-50">
            <div class="flex items-center px-6 py-4">
              <div class="flex-shrink-0 h-16 w-16">
                <img 
                  src={image.thumbnail || image.url} 
                  alt={image.altText || image.name}
                  class="h-16 w-16 rounded-md object-cover"
                  on:click={() => selectImage(image)}
                />
              </div>
              
              <div class="ml-4 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      on:click={() => selectImage(image)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="text-red-600 hover:text-red-900 text-sm font-medium"
                      on:click={() => deleteImage(image.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div class="mt-1 flex items-center text-sm text-gray-500">
                  <span>{image.size}</span>
                  <span class="mx-2">•</span>
                  <span>{image.dimensions}</span>
                  <span class="mx-2">•</span>
                  <span class="capitalize">{image.category}</span>
                </div>
                
                <div class="mt-1 flex flex-wrap gap-1">
                  {#each image.tags as tag}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Image Detail Modal -->
  {#if selectedImage}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" on:click={() => selectedImage = null}>
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" on:click|stopPropagation>
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">{selectedImage.name}</h3>
            <button
              class="text-gray-400 hover:text-gray-600"
              on:click={() => selectedImage = null}
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex flex-col md:flex-row gap-6">
            <div class="md:w-1/2">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.altText}
                class="w-full rounded-md"
              />
            </div>
            
            <div class="md:w-1/2 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <p class="mt-1 text-sm text-gray-900">{selectedImage.name}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Dimensions</label>
                <p class="mt-1 text-sm text-gray-900">{selectedImage.dimensions}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">File Size</label>
                <p class="mt-1 text-sm text-gray-900">{selectedImage.size}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Type</label>
                <p class="mt-1 text-sm text-gray-900">{selectedImage.type}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Uploaded</label>
                <p class="mt-1 text-sm text-gray-900">{new Date(selectedImage.uploadedAt).toLocaleDateString()} by {selectedImage.uploadedBy}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Alt Text</label>
                <p class="mt-1 text-sm text-gray-900">{selectedImage.altText || 'No alt text provided'}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Tags</label>
                <div class="mt-1 flex flex-wrap gap-1">
                  {#each selectedImage.tags as tag}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
              
              <div class="flex space-x-3 pt-4">
                <Button on:click={() => window.open(selectedImage.url, '_blank')}>
                  View Full Size
                </Button>
                <Button variant="outline" on:click={() => selectedImage = null}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>