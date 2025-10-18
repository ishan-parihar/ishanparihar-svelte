<script lang="ts">
  let { 
    dateRange,
    onChange 
  } = $props<{
    dateRange: { from: string; to: string };
    onChange?: (dateRange: { from: string; to: string }) => void;
  }>();
  
  let from = $state(dateRange.from);
  let to = $state(dateRange.to);
  
  // Update internal values when props change
  $effect(() => {
    from = dateRange.from;
    to = dateRange.to;
  });
  
  function handleFromChange(e: Event) {
    const target = e.target as HTMLInputElement;
    from = target.value;
    onChange?.({ from, to });
  }
  
  function handleToChange(e: Event) {
    const target = e.target as HTMLInputElement;
    to = target.value;
    onChange?.({ from, to });
  }
  
  function handleDateRangeChange() {
    onChange?.({ from, to });
  }
</script>

<div class="flex items-center space-x-4">
  <div class="flex items-center space-x-2">
    <label for="from-date" class="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
<input
  id="from-date"
  type="date"
  bind:value={from}
  onchange={handleFromChange}
  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
/>
  </div>
  
  <div class="flex items-center space-x-2">
    <label for="to-date" class="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
<input
  id="to-date"
  type="date"
  bind:value={to}
  onchange={handleToChange}
  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
/>
  </div>
  
<button
  onclick={handleDateRangeChange}
  class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
>
  Apply
</button>
</div>