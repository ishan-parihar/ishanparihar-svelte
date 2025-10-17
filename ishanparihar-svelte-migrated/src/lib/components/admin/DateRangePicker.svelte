<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let dateRange: { from: string; to: string };
  
  const dispatch = createEventDispatcher();
  
  let from = dateRange.from;
  let to = dateRange.to;
  
  // Update internal values when props change
  $: from = dateRange.from;
  $: to = dateRange.to;
  
  function handleFromChange(e: Event) {
    const target = e.target as HTMLInputElement;
    from = target.value;
    dispatch('change', { from });
  }
  
  function handleToChange(e: Event) {
    const target = e.target as HTMLInputElement;
    to = target.value;
    dispatch('change', { to });
  }
  
  function handleDateRangeChange() {
    dispatch('change', { from, to });
  }
</script>

<div class="flex items-center space-x-4">
  <div class="flex items-center space-x-2">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
    <input
      type="date"
      bind:value={from}
      on:change={handleFromChange}
      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
    />
  </div>
  
  <div class="flex items-center space-x-2">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
    <input
      type="date"
      bind:value={to}
      on:change={handleToChange}
      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
    />
  </div>
  
  <button
    on:click={handleDateRangeChange}
    class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
  >
    Apply
  </button>
</div>