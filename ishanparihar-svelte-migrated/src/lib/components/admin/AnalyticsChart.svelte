<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    Chart as ChartJS,
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement
  } from 'chart.js';
  
  // Register chart components
  ChartJS.register(
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
  
  export let type: 'line' | 'bar' | 'doughnut' = 'line';
  export let title: string;
  export let data: any;
  export let loading: boolean = false;
  
  let canvasRef: HTMLCanvasElement;
  let chart: ChartJS;
  
  // Create chart when component mounts or data changes
  $: if (data && canvasRef && !loading) {
    createChart();
  }
  
  onMount(() => {
    if (data && canvasRef) {
      createChart();
    }
  });
  
  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
  
 function createChart() {
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy();
    }
    
    // Get context from canvas
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    
    // Define chart configuration based on type
    const chartConfig: any = {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: type !== 'doughnut' ? {
          x: {
            display: true,
          },
          y: {
            display: true,
          }
        } : {}
      }
    };
    
    // Create new chart
    chart = new ChartJS(ctx, chartConfig);
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-80">
  <div class="h-full flex items-center justify-center">
    {#if loading}
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    {:else if data}
      <canvas bind:this={canvasRef}></canvas>
    {:else}
      <p class="text-gray-600 dark:text-gray-400">No data available</p>
    {/if}
 </div>
</div>