<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { inView } from '$lib/actions';

  let {
    className = '',
    delay = 0,
  } = $props();

  let isInView = false;
</script>

<div
  use:inView={{ rootMargin: '-10% 0px' }}
  on:intersect={() => (isInView = true)}
  class={className}
>
  {#if isInView}
    <div transition:fly={{ y: 20, duration: 600, delay }} class="h-full w-full">
      <slot />
    </div>
  {/if}
</div>