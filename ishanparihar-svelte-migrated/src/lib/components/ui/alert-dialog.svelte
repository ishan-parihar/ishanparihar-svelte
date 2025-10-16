<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let {
    open = false,
  } = $props();

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
    <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-none md:w-full">
      <slot {close} />
    </div>
  </div>
{/if}
