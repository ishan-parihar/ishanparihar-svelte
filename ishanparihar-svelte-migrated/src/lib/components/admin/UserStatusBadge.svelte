<script lang="ts">
  export let suspended = false;
  export let isFlagged = false;
  export let emailVerified = false;
</script>

{#if suspended}
  <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
    Suspended
  </span>
{:else if isFlagged}
  <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
    Flagged
  </span>
{:else if !emailVerified}
  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded-full">
    Unverified
  </span>
{:else}
  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
    Active
  </span>
{/if}