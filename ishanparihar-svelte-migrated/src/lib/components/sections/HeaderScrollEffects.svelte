<script lang="ts">
  import { onMount } from 'svelte';

  let scrolled = $state(false);
  let scrollProgress = $state(0);
  let visible = $state(true);
  let isDark = $state(false); // Mock theme

  function handleScroll() {
    const offset = window.scrollY;
    setVisible(true);
    scrolled = offset > 20;

    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? Math.min(offset / height, 1) : 0;
    scrollProgress = progress;
  }

  function handleResize() {
    // Trigger re-calculation
    scrolled = scrolled;
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });

  const headerBg = $derived(isDark ? '#1C1C1F' : '#E8E8DE');
  const headerBorder = $derived(isDark ? (scrolled ? '#404040' : '#2E2E32') : (scrolled ? '#D8D8CE' : '#E0E0D6'));
  const headerShadow = $derived(scrolled ? (isDark ? '0 4px 10px rgba(0, 0, 0, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.05)') : 'none');

  $effect(() => {
    const header = document.querySelector('header.header-nav') as HTMLElement;
    if (header) {
      header.classList.toggle('scrolled', scrolled);
      header.style.background = headerBg;
      header.style.borderBottom = `1px solid ${headerBorder}`;
      header.style.boxShadow = headerShadow;
      header.style.transform = '';
      header.style.opacity = '';
      header.style.transition = 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
    }
  });

</script>

<!-- This component does not render anything -->