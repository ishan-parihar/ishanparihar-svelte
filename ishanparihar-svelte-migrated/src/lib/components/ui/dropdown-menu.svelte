<script lang="ts">
  let {
    open = false,
  } = $props();

  function close() {
    open = false;
  }
</script>

<div class="relative inline-block text-left">
  <div on:click={() => open = !open}>
    <slot name="trigger" />
  </div>

  {#if open}
    <div
      class="origin-top-right absolute right-0 mt-2 w-56 rounded-none shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div class="py-1" role="none">
        <slot {close} />
      </div>
    </div>
  {/if}
</div>
