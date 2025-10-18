<script lang="ts">
  import HeaderLogo from '$lib/components/ui/HeaderLogo.svelte';
  import HeaderMobileMenu from '$lib/components/layout/HeaderMobileMenu.svelte';
  import HeaderNavLinks from '$lib/components/layout/HeaderNavLinks.svelte';
  import HeaderAuthButtons from '$lib/components/layout/HeaderAuthButtons.svelte';
  import HeaderLoadingIndicator from '$lib/components/layout/HeaderLoadingIndicator.svelte';
  import HeaderScrollEffects from '$lib/components/layout/HeaderScrollEffects.svelte';
  import '../app.css';
</script>

<HeaderScrollEffects />

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
      <HeaderAuthButtons />
    </nav>

    <HeaderLoadingIndicator />
  </div>
</header>

<main class="pt-16 lg:pt-20">
  <slot />
</main>
