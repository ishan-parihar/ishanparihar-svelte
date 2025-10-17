<script lang="ts">
  import { page } from '$app/stores';
  import { navigationItems } from '$lib/config/navigation';
  import { ChevronDown } from 'lucide-svelte';
  import DropdownMenu from '$lib/components/ui/dropdown-menu.svelte';
  import { slide } from 'svelte/transition';
</script>

<div class="flex items-center space-x-2 lg:space-x-4">
  {#each navigationItems as item}
    {@const isActive = $page.url.pathname === item.path || (item.dropdownItems && item.dropdownItems.some(subItem => $page.url.pathname === subItem.path))}

    {#if item.hasDropdown}
      <DropdownMenu>
        {#snippet trigger()}
          <button
            class="relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-1 bg-transparent border-none cursor-pointer {isActive ? 'text-accent font-bold scale-105' : 'text-muted-foreground hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none"
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{item.name}</span>
            <ChevronDown class="h-3 w-3 transition-transform duration-200" />
            {#if isActive}
              <div transition:slide={{ duration: 200, axis: 'x' }} class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"></div>
            {/if}
          </button>
        {/snippet}
        {#snippet children()}
          <div class="w-72 rounded-none border shadow-lg backdrop-blur-sm">
            {#each item.dropdownItems as subItem}
              <div class="rounded-none">
                <a href={subItem.path} class="block w-full px-4 py-3 transition-all duration-200 rounded-none group {$page.url.pathname === subItem.path ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-foreground hover:bg-muted hover:text-accent hover:border-l-2 hover:border-accent/50 border-l-2 border-transparent'}">
                  <div class="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                    {subItem.name}
                  </div>
                  <div class="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80">
                    {subItem.description}
                  </div>
                </a>
              </div>
            {/each}
          </div>
        {/snippet}
      </DropdownMenu>
    {:else}
      <a href={item.path} class="relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105 {isActive ? 'text-accent font-bold scale-105' : 'text-muted-foreground hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none" aria-current={isActive ? 'page' : undefined}>
        <span>{item.name}</span>
        {#if isActive}
          <div transition:slide={{ duration: 200, axis: 'x' }} class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"></div>
        {/if}
      </a>
    {/if}
  {/each}
</div>
