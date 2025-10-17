<script lang="ts">
  let {
    open = false,
    children,
    trigger,
  } = $props();

  function close() {
    open = false;
  }
</script>

<div class="relative inline-block text-left">
  <button
    type="button"
    onclick={() => open = !open}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open = !open;
      }
    }}
    aria-haspopup="true"
    aria-expanded={open}
    class="inline-flex w-full justify-center"
  >
    {@render trigger?.()}
  </button>

  {#if open}
    <div
      class="origin-top-right absolute right-0 mt-2 w-56 rounded-none shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
      aria-orientation="vertical"
    >
      <div class="py-1" role="none">
        {@render children?.({ close })}
      </div>
    </div>
  {/if}
</div>
