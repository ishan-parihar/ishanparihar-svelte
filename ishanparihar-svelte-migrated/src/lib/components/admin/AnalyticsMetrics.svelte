<script lang="ts">
  import { 
    Users, 
    FileText, 
    MessageSquare, 
    DollarSign,
    HeadphonesIcon,
    Mail
  } from 'lucide-svelte';
  
  export let data: any;
  
  // Define metrics data structure
  interface MetricCard {
    id: string;
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
  }
  
  // Reactive statement to update cards when data changes
 $: metricCards: MetricCard[] = [
    {
      id: 'users',
      title: 'Total Users',
      value: data?.totalUsers || 0,
      change: data?.userGrowth || 0,
      icon: Users,
      color: 'blue'
    },
    {
      id: 'blog',
      title: 'Blog Posts',
      value: data?.totalBlogPosts || 0,
      change: data?.blogGrowth || 0,
      icon: FileText,
      color: 'green'
    },
    {
      id: 'comments',
      title: 'Comments',
      value: data?.totalComments || 0,
      change: data?.commentGrowth || 0,
      icon: MessageSquare,
      color: 'purple'
    },
    {
      id: 'sales',
      title: 'Revenue',
      value: `$${data?.totalRevenue || 0}`,
      change: data?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      id: 'support',
      title: 'Support Tickets',
      value: data?.openTickets || 0,
      change: data?.ticketChange || 0,
      icon: HeadphonesIcon,
      color: 'red'
    },
    {
      id: 'newsletter',
      title: 'Subscribers',
      value: data?.newsletterSubscribers || 0,
      change: data?.subscriberGrowth || 0,
      icon: Mail,
      color: 'indigo'
    }
  ];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each metricCards as metric}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div 
            class="p-2 rounded-lg"
            class:bg-blue-100={metric.color === 'blue'}
            class:bg-green-100={metric.color === 'green'}
            class:bg-purple-100={metric.color === 'purple'}
            class:bg-yellow-100={metric.color === 'yellow'}
            class:bg-red-100={metric.color === 'red'}
            class:bg-indigo-100={metric.color === 'indigo'}
            class:dark:bg-blue-900/20={metric.color === 'blue'}
            class:dark:bg-green-900/20={metric.color === 'green'}
            class:dark:bg-purple-900/20={metric.color === 'purple'}
            class:dark:bg-yellow-900/20={metric.color === 'yellow'}
            class:dark:bg-red-900/20={metric.color === 'red'}
            class:dark:bg-indigo-900/20={metric.color === 'indigo'}
          >
            <svelte:component 
              this={metric.icon} 
              class="w-6 h-6"
              class:text-blue-600={metric.color === 'blue'}
              class:text-green-600={metric.color === 'green'}
              class:text-purple-600={metric.color === 'purple'}
              class:text-yellow-600={metric.color === 'yellow'}
              class:text-red-600={metric.color === 'red'}
              class:text-indigo-600={metric.color === 'indigo'}
              class:dark:text-blue-400={metric.color === 'blue'}
              class:dark:text-green-400={metric.color === 'green'}
              class:dark:text-purple-400={metric.color === 'purple'}
              class:dark:text-yellow-400={metric.color === 'yellow'}
              class:dark:text-red-400={metric.color === 'red'}
              class:dark:text-indigo-400={metric.color === 'indigo'}
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
          <div 
            class="w-2 h-2 rounded-full"
            class:bg-green-500={metric.change > 0}
            class:bg-red-500={metric.change <= 0}
          ></div>
        </div>
      </div>
    </div>
  {/each}
</div>