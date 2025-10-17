<script lang="ts">
  import { onMount } from 'svelte';
  import AnalyticsMetrics from '$lib/components/admin/AnalyticsMetrics.svelte';
  import AnalyticsChart from '$lib/components/admin/AnalyticsChart.svelte';
  import DateRangePicker from '$lib/components/admin/DateRangePicker.svelte';
  import { apiClient } from '$lib/api/client';
  
  let analyticsData: any = null;
  let loading = true;
  let dateRange = {
    from: new Date(Date.now() - 30 * 24 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  };
  
  onMount(async () => {
    await loadAnalyticsData();
  });
  
  async function loadAnalyticsData() {
    try {
      loading = true;
      analyticsData = await apiClient.admin.getAnalytics(dateRange);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      loading = false;
    }
  }
  
  async function handleDateRangeChange(newRange: any) {
    dateRange = { ...dateRange, ...newRange };
    await loadAnalyticsData();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Monitor your site's performance and user engagement
      </p>
    </div>
    
    <DateRangePicker 
      {dateRange}
      on:change={(e) => handleDateRangeChange(e.detail)}
    />
 </div>
  
  <!-- Metrics Overview -->
  {#if analyticsData}
    <AnalyticsMetrics data={analyticsData.metrics} />
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AnalyticsChart 
        type="line"
        title="User Growth"
        data={analyticsData.userGrowth}
        {loading}
      />
      
      <AnalyticsChart 
        type="bar"
        title="Page Views"
        data={analyticsData.pageViews}
        {loading}
      />
      
      <AnalyticsChart 
        type="doughnut"
        title="Traffic Sources"
        data={analyticsData.trafficSources}
        {loading}
      />
      
      <AnalyticsChart 
        type="line"
        title="Revenue Trend"
        data={analyticsData.revenue}
        {loading}
      />
    </div>
  {/if}
</div>