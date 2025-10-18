<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let comments = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let pagination = $state({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  let filters = $state({
    status: 'all',
    type: 'all',
    search: ''
  });

  onMount(async () => {
    await loadComments();
  });

  async function loadComments() {
    try {
      loading = true;
      error = null;
      
      // Simulating API call - in real implementation, this would fetch from server
      comments = [
        {
          id: '1',
          content: 'This is a very insightful article. Thank you for sharing!',
          author: 'John Smith',
          email: 'john@example.com',
          postTitle: 'Understanding Mindfulness',
          status: 'approved',
          type: 'blog',
          createdAt: '2023-05-15',
          updatedAt: '2023-05-15',
          isSpam: false
        },
        {
          id: '2',
          content: 'I found this post very helpful for my personal growth journey.',
          author: 'Sarah Johnson',
          email: 'sarah@example.com',
          postTitle: 'Emotional Intelligence Workshop',
          status: 'pending',
          type: 'blog',
          createdAt: '2023-05-14',
          updatedAt: '2023-05-14',
          isSpam: false
        },
        {
          id: '3',
          content: 'This comment may be spam. Please review.',
          author: 'Unknown User',
          email: 'spam@example.com',
          postTitle: 'Leadership Excellence',
          status: 'pending',
          type: 'blog',
          createdAt: '2023-05-13',
          updatedAt: '2023-05-13',
          isSpam: true
        },
        {
          id: '4',
          content: 'Thanks for this valuable content!',
          author: 'Michael Brown',
          email: 'michael@example.com',
          postTitle: 'Mindfulness Mastery',
          status: 'approved',
          type: 'blog',
          createdAt: '2023-05-12',
          updatedAt: '2023-05-12',
          isSpam: false
        },
        {
          id: '5',
          content: 'Interesting perspective on this topic.',
          author: 'Emily Davis',
          email: 'emily@example.com',
          postTitle: 'Personal Transformation',
          status: 'rejected',
          type: 'blog',
          createdAt: '2023-05-11',
          updatedAt: '2023-05-11',
          isSpam: false
        }
      ];
      
      pagination.total = comments.length;
      pagination.totalPages = Math.ceil(comments.length / pagination.limit);
    } catch (err) {
      error = 'Failed to load comments';
      console.error('Error loading comments:', err);
    } finally {
      loading = false;
    }
  }

  const handleFilterChange = (newFilters) => {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadComments();
  };

  const handlePageChange = (newPage) => {
    pagination.page = newPage;
    loadComments();
  };

  const approveComment = async (commentId) => {
    loading = true;
    try {
      // Simulate API call to approve comment
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.status = 'approved';
      }
    } catch (err) {
      error = 'Failed to approve comment';
      console.error('Error approving comment:', err);
    } finally {
      loading = false;
    }
  };

  const rejectComment = async (commentId) => {
    loading = true;
    try {
      // Simulate API call to reject comment
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.status = 'rejected';
      }
    } catch (err) {
      error = 'Failed to reject comment';
      console.error('Error rejecting comment:', err);
    } finally {
      loading = false;
    }
  };

  const deleteComment = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      loading = true;
      try {
        // Simulate API call to delete comment
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real app, this would make an API call
        comments = comments.filter(c => c.id !== commentId);
        pagination.total = comments.length;
        pagination.totalPages = Math.ceil(comments.length / pagination.limit);
      } catch (err) {
        error = 'Failed to delete comment';
        console.error('Error deleting comment:', err);
      } finally {
        loading = false;
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpamClass = (isSpam) => {
    return isSpam ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700';
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Comments Management</h1>
    <p class="mt-1 text-sm text-gray-600">
      Moderate and manage user comments
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

  <!-- Filters -->
  <div class="bg-white shadow rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Comments</label>
        <input
          id="search"
          type="text"
          placeholder="Search by author or content..."
          bind:value={filters.search}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          bind:value={filters.status}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
          <option value="blog">Blog</option>
          <option value="service">Service</option>
          <option value="project">Project</option>
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
                Author
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each comments as comment (comment.id)}
              <tr class={`hover:bg-gray-50 ${getSpamClass(comment.isSpam)}`}>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{comment.author}</div>
                  <div class="text-sm text-gray-500">{comment.email}</div>
                  <div class="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-md truncate">{comment.content}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comment.postTitle}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(comment.status)}`}>
                    {comment.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comment.type}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {#if comment.status === 'pending'}
                    <button
                      type="button"
                      class="text-green-600 hover:text-green-900 mr-3"
                      on:click={() => approveComment(comment.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      class="text-red-600 hover:text-red-900 mr-3"
                      on:click={() => rejectComment(comment.id)}
                    >
                      Reject
                    </button>
                  {/if}
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900"
                    on:click={() => deleteComment(comment.id)}
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