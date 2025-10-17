<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
  import { navigationItems } from '$lib/config/navigation';
  import { auth } from '$lib/stores/auth';
  import { Menu, X, UserCircle2 } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  $: if ($page.url.pathname) {
    isMenuOpen = false;
  }
</script>

<button
  class="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-transparent"
  on:click={toggleMenu}
  aria-label="Toggle menu"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
>
  {#if isMenuOpen}
    <div transition:slide={{ duration: 150, axis: 'x' }}><X size={16} class="text-slate-700 dark:text-slate-100" /></div>
  {:else}
    <div transition:slide={{ duration: 150, axis: 'x' }}><Menu size={16} class="text-slate-700 dark:text-slate-100" /></div>
  {/if}
</button>

{#if isMenuOpen}
  <div
    transition:slide={{ duration: 300 }}
    id="mobile-menu"
    class="md:hidden border-b border-black/10 dark:border-white/10 shadow-lg fixed top-[60px] left-0 right-0 z-50 bg-white dark:bg-black"
    role="navigation"
    aria-label="Mobile navigation"
  >
    <div class="w-full mx-auto px-4 py-5">
      <div class="flex flex-col space-y-3 items-center">
        {#each navigationItems as item}
          <div class="w-full">
            <a
              href={item.path}
              class="relative px-3 py-1.5 text-sm font-bold transition-all duration-300 rounded-none block w-full text-center transform hover:scale-105"
              class:text-accent={item.path === $page.url.pathname}
              class:bg-accent-10={item.path === $page.url.pathname}
              class:scale-105={item.path === $page.url.pathname}
              class:text-foreground={item.path !== $page.url.pathname}
              class:hover:text-accent={item.path !== $page.url.pathname}
              class:hover:bg-muted={item.path !== $page.url.pathname}
              aria-current={item.path === $page.url.pathname ? 'page' : undefined}
            >
              <span>{item.name}</span>
            </a>
            {#if item.hasDropdown && item.dropdownItems}
              <div class="mt-2 ml-4 space-y-2">
                {#each item.dropdownItems as subItem}
                  <a
                    href={subItem.path}
                    class="block px-3 py-1.5 text-xs rounded-none transition-all duration-300"
                    class:text-accent={subItem.path === $page.url.pathname}
                    class:bg-accent-10={subItem.path === $page.url.pathname}
                    class:text-muted-foreground={subItem.path !== $page.url.pathname}
                    class:hover:text-accent={subItem.path !== $page.url.pathname}
                    class:hover:bg-muted={subItem.path !== $page.url.pathname}
                  >
                    {subItem.name}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        {#if $auth.user}
          <Button
            asChild
            variant="outline"
            class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
          >
            <a href="/account" class="flex items-center justify-center gap-2">
              <UserCircle2 class="h-4 w-4" />
              <span class="text-sm font-medium">My Account</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            class="w-full py-2.5 rounded-none"
            on:click={() => {
              // signOut({ callbackUrl: '/', redirect: true })
            }}
          >
            Sign Out
          </Button>
        {:else}
          <Button
            variant="outline"
            class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
            href="/login"
          >
            <span class="text-sm font-medium">Sign In</span>
          </Button>
          <Button
            variant="ghost"
            class="w-full py-2.5 rounded-none"
            href="/signup"
          >
            Create Account
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}