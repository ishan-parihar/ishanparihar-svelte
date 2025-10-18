<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let className = '';
  export let delay = 0;

  let element: HTMLElement;
  let isInView = false;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isInView = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  });
</script>

<div bind:this={element} class="{className}">
  {#if isInView}
    <div in:fly={{ y: 20, duration: 600, delay }}>
      <slot />
    </div>
  {/if}
</div>
