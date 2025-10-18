<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  
  let user = $state({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    joinDate: '2023-01-15',
    lastLogin: '2023-10-15'
  });
  
  let recentOrders = $state([]);
  let loading = $state(true);
  let error = $state(null);
  
  onMount(async () => {
    try {
      // Get user profile info
      const profileResponse = await fetch('/api/users/profile');
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        user = {
          ...user,
          name: profile.name || user.name,
          email: profile.email || user.email,
          avatar: profile.avatar || user.avatar
        };
      }
      
      // Get recent orders
      const ordersResponse = await apiClient.orders.getOrders();
      recentOrders = (ordersResponse.orders || []).slice(0, 3); // Get only 3 most recent
    } catch (err) {
      console.error('Failed to load account data:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function getStatusClass(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
</script>

<svelte:head>
  <title>My Account</title>
  <meta name="description" content="Manage your account, orders, and preferences." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Manage your account settings, orders, and preferences
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else}
      {#if error}
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p class="text-red-600 dark:text-red-400">{error}</p>
        </div>
      {/if}
      
      <!-- User Profile Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
        <div class="px-6 py-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              {#if user.avatar}
                <img class="h-16 w-16 rounded-full object-cover" src={user.avatar} alt={user.name + "'s profile picture"} />
              {:else}
                <div class="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-xl font-bold text-gray-500 dark:text-gray-400">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              {/if}
            </div>
            <div class="ml-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p class="mt-1 text-gray-600 dark:text-gray-400">{user.email}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Member since {formatDate(user.joinDate)} • Last login: {formatDate(user.lastLogin)}
              </p>
            </div>
            <div class="ml-auto">
              <a href="/account/profile" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Account Management -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Recent Orders -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
              <a href="/account/orders" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                View All
              </a>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              {#if recentOrders.length === 0}
                <div class="p-6 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders yet</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You haven't placed any orders yet.
                  </p>
                  <div class="mt-6">
                    <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                      Browse Services
                    </a>
                  </div>
                </div>
              {:else}
                {#each recentOrders as order (order.id)}
                  <div class="px-6 py-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Order #{order.order_number}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span class={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div class="mt-4">
                      <ul class="space-y-2">
                        {#each order.order_items as item (item.id)}
                          <li class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>{item.service_title} × {item.quantity}</span>
                            <span>₹{item.total_price.toLocaleString()}</span>
                          </li>
                        {/each}
                      </ul>
                    </div>
                    
                    <div class="mt-4 flex items-center justify-between">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        Total: <span class="font-medium text-gray-900 dark:text-white">₹{order.total_amount.toLocaleString()}</span>
                      </div>
                      <a href={`/account/orders/${order.id}`} class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        View Details
                      </a>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Right Column: Quick Actions -->
        <div class="space-y-8">
          <!-- Account Actions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
            </div>
            <div class="p-6">
              <ul class="space-y-3">
                <li>
                  <a href="/account/profile" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile Information</span>
                  </a>
                </li>
                <li>
                  <a href="/account/topics" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Topic Preferences</span>
                  </a>
                </li>
                <li>
                  <a href="/account/security" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Security Settings</span>
                  </a>
                </li>
                <li>
                  <a href="/account/notifications" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email Preferences</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Order Management -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Order Management</h2>
            </div>
            <div class="p-6">
              <ul class="space-y-3">
                <li>
                  <a href="/account/orders" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>View All Orders</span>
                  </a>
                </li>
                <li>
                  <a href="/account/orders/track" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Track Orders</span>
                  </a>
                </li>
                <li>
                  <a href="/account/orders/returns" class="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Returns & Exchanges</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>