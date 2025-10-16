<script lang="ts">
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  import { ChevronDown } from 'lucide-svelte';
  import { navigationItems, type NavigationItem } from '$lib/config/navigation';
  import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
  import DropdownMenuTrigger from '$lib/components/ui/DropdownMenuTrigger.svelte';
  import DropdownMenuContent from '$lib/components/ui/DropdownMenuContent.svelte';
  import DropdownMenuItem from '$lib/components/ui/DropdownMenuItem.svelte';

  let activePath = $page.url.pathname;

  // Mock theme store
  let isDark = $state(false);

  function isActive(item: NavigationItem) {
    if (item.path === activePath) return true;
    if (item.dropdownItems) {
      return item.dropdownItems.some(subItem => subItem.path === activePath);
    }
    return false;
  }
</script>

<div class="flex items-center space-x-2 lg:space-x-4">
  {#each navigationItems as item}
    {@const active = isActive(item)}
    {#if item.hasDropdown}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            data-active={active}
            class="relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-1 bg-transparent border-none cursor-pointer {active ? 'text-accent font-bold scale-105' : 'text-muted-foreground hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none"
            aria-current={active ? 'page' : undefined}
          >
            <span>{item.name}</span>
            <ChevronDown class="h-3 w-3 transition-transform duration-200" />
            {#if active}
              <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"></div>
            {/if}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          class="w-72 rounded-none border shadow-lg backdrop-blur-sm"
          style="background-color: {isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border-color: {isDark ? 'rgb(39, 39, 42)' : 'rgb(229, 231, 235)'}; box-shadow: {isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};"
        >
          {#each item.dropdownItems as subItem}
            <DropdownMenuItem asChild class="rounded-none">
              <a href={subItem.path} class="block w-full px-4 py-3 transition-all duration-200 rounded-none group {activePath === subItem.path ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-foreground hover:bg-muted hover:text-accent hover:border-l-2 hover:border-accent/50 border-l-2 border-transparent'}">
                <div class="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                  {subItem.name}
                </div>
                <div class="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80">
                  {subItem.description}
                </div>
              </a>
            </DropdownMenuItem>
          {/each}
        </DropdownMenuContent>
      </DropdownMenu>
    {:else}
      <a href={item.path} data-active={active} class="relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105 {active ? 'text-accent font-bold scale-105' : 'text-muted-foreground hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none" aria-current={active ? 'page' : undefined}>
        <span>{item.name}</span>
        {#if active}
          <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"></div>
        {/if}
      </a>
    {/if}
  {/each}
</div>