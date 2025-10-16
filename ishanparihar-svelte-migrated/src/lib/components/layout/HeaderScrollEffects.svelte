<script lang="ts">
  import { onMount } from 'svelte';

  let scrolled = false;
  let header: HTMLElement;

  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  $: if (header) {
    header.classList.toggle('scrolled', scrolled);
  }
</script>

<svelte:window on:scroll={handleScroll} />