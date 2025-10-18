<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PERMISSION_SCOPES } from '$lib/constants/permissions';
  import { 
    Users, 
    FileText, 
    MessageSquare, 
    TrendingUp,
    ShoppingCart,
    Headphones,
    Mail,
    DollarSign
  } from 'lucide-svelte';
  
  export let metrics: any;
  export let permissions: string[];
  
  const dispatch = createEventDispatcher();
  
  function hasPermission(permission: string): boolean {
    return permissions.includes(permission);
  }
  
  const metricCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: metrics.totalUsers || 0,
      change: metrics.userGrowth || 0,
      icon: Users,
      color: 'blue',
      permission: PERMISSION_SCOPES.ADMIN_USERS,
      href: '/admin/users'
    },
    {
      id: 'blog',
      title: 'Blog Posts',
      value: metrics.totalBlogPosts || 0,
      change: metrics.blogGrowth || 0,
      icon: FileText,
      color: 'green',
      permission: PERMISSION_SCOPES.BLOG_EDIT,
      href: '/admin/blog'
    },
    {
      id: 'comments',
      title: 'Comments',
      value: metrics.totalComments || 0,
      change: metrics.commentGrowth || 0,
      icon: MessageSquare,
      color: 'purple',
      permission: PERMISSION_SCOPES.BLOG_EDIT,
      href: '/admin/comments'
    },
    {
      id: 'sales',
      title: 'Revenue',
      value: `$${metrics.totalRevenue || 0}`,
      change: metrics.revenueGrowth || 0,
      icon: DollarSign,
      color: 'yellow',
      permission: PERMISSION_SCOPES.ADMIN_DASHBOARD,
      href: '/admin/sales'
    },
    {
      id: 'support',
      title: 'Support Tickets',
      value: metrics.openTickets || 0,
      change: metrics.ticketChange || 0,
      icon: Headphones,
      color: 'red',
      permission: PERMISSION_SCOPES.ADMIN_DASHBOARD,
      href: '/admin/support'
    },
    {
      id: 'newsletter',
      title: 'Subscribers',
      value: metrics.newsletterSubscribers || 0,
      change: metrics.subscriberGrowth || 0,
      icon: Mail,
      color: 'indigo',
      permission: PERMISSION_SCOPES.ADMIN_DASHBOARD,
      href: '/admin/newsletter'
    }
  ];
  
  $: visibleMetrics = metricCards.filter(card => 
    hasPermission(card.permission)
  );
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each visibleMetrics as metric}
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
    onclick={() => dispatch('navigate', metric.href)}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') dispatch('navigate', metric.href); }}
    role="button"
    tabindex="0"
  >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-{metric.color}-100 dark:bg-{metric.color}-900/20 rounded-lg">
            <svelte:component 
              this={metric.icon} 
              class="w-6 h-6 text-{metric.color}-600 dark:text-{metric.color}-400"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {metric.title}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </div>
        </div>
        
        <div class="text-right">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </p>
          <div class="w-2 h-2 rounded-full bg-{metric.change > 0 ? 'green' : 'red'}-500"></div>
        </div>
      </div>
    </div>
  {/each}
</div>