<script lang="ts">
  import { navigating } from '$app/stores';

  let {
    href,
    showIndicator = true,
    class: className = "",
  } = $props();

  let isClicked = $state(false);

  function handleClick() {
    if (showIndicator) {
      isClicked = true;
      setTimeout(() => (isClicked = false), 1500);
    }
  }
</script>

<a {href} class="relative {className}" on:click={handleClick}>
  <slot />

  {#if showIndicator && isClicked}
    <div class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 rounded-none z-10">
      <!-- TODO: Add pulsing dots animation -->
    </div>
  {/if}
</a>
