<script lang="ts">

  import { fly } from 'svelte/transition';
  import { Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';
  import MobileNavLinks from './MobileNavLinks.svelte';
  import MobileAuthButtons from './MobileAuthButtons.svelte';

  let isMenuOpen = $state(false);

  // Mock theme
  let isDark = $state(false);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  $effect(() => {
    const unsubscribe = page.subscribe(() => {
      isMenuOpen = false;
    });
    return unsubscribe;
  });

  const headerBg = $derived(isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)');

</script>

<button
  class="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 border {isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'} bg-transparent"
  onclick={toggleMenu}
  aria-label="Toggle menu"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
>
  {#if isMenuOpen}
    <div transition:fly={{ y: -10, duration: 150 }}>
      <X size={16} class={isDark ? 'text-slate-100' : 'text-slate-700'} />
    </div>
  {:else}
    <div transition:fly={{ y: 10, duration: 150 }}>
      <Menu size={16} class={isDark ? 'text-slate-100' : 'text-slate-700'} />
    </div>
  {/if}
</button>

{#if isMenuOpen}
  <div transition:fly={{ y: -20, duration: 300 }} id="mobile-menu" class="md:hidden border-b border-black/10 dark:border-white/10 shadow-lg fixed top-[60px] left-0 right-0 z-50" role="navigation" aria-label="Mobile navigation" style="background: {headerBg}">
    <div class="w-full mx-auto px-4 py-5">
      <MobileNavLinks />
      <MobileAuthButtons />
    </div>
  </div>
{/if}