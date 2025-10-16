<script lang="ts">
  import HeaderMobileMenu from '$lib/components/sections/HeaderMobileMenu.svelte';
  import HeaderNavLinks from '$lib/components/sections/HeaderNavLinks.svelte';
  import HeaderScrollEffects from '$lib/components/sections/HeaderScrollEffects.svelte';
  import HeaderAuthButtons from '$lib/components/sections/HeaderAuthButtons.svelte';
  import HeaderLogo from '$lib/components/ui/HeaderLogo.svelte';
  import HeaderLoadingIndicator from '$lib/components/loading/HeaderLoadingIndicator.svelte';

  export let showAuthButtons = true;
</script>

<header class="fixed top-0 z-50 w-full h-16 lg:h-20 header-nav text-foreground bg-background border-b border-border">
  <div class="w-full h-full mx-auto flex items-center px-4 md:px-6 relative">
    <div class="flex items-center relative z-10 mr-auto">
      <HeaderLogo />
    </div>

    <div class="flex items-center gap-2 md:hidden">
      <HeaderMobileMenu />
    </div>

    <nav class="hidden md:flex items-center space-x-3 lg:space-x-5 ml-auto">
      <HeaderNavLinks />

      {#if showAuthButtons}
        <HeaderAuthButtons />
      {/if}
    </nav>

    <HeaderLoadingIndicator />
  </div>
</header>

<HeaderScrollEffects />
