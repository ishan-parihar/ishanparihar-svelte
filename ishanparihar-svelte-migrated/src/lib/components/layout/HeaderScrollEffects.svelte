<script lang="ts">
  import { onMount } from 'svelte';

  let scrolled = $state(false);
  let header: HTMLElement | null = null;

  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  onMount(() => {
    header = document.querySelector('header.header-nav') as HTMLElement;
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  $effect(() => {
    if (header) {
      header.classList.toggle('scrolled', scrolled);
    }
  });
</script>