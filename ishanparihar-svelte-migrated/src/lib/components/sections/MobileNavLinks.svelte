<script lang="ts">
  import { page } from '$app/stores';
  import { navigationItems, type NavigationItem } from '$lib/config/navigation';

  let activePath = $page.url.pathname;

  function isActive(item: NavigationItem) {
    if (item.path === activePath) return true;
    if (item.dropdownItems) {
      return item.dropdownItems.some(subItem => subItem.path === activePath);
    }
    return false;
  }
</script>

<div class="flex flex-col space-y-3 items-center">
  {#each navigationItems as item}
    {@const active = isActive(item)}
    <div class="w-full">
      <a href={item.path} data-active={active} class="relative px-3 py-1.5 text-sm font-bold transition-all duration-300 rounded-none block w-full text-center transform hover:scale-105 {active ? 'text-accent bg-accent/10 scale-105' : 'text-foreground hover:text-accent hover:bg-muted'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1" aria-current={active ? 'page' : undefined}>
        <span>{item.name}</span>
      </a>

      {#if item.hasDropdown && item.dropdownItems}
        <div class="mt-2 ml-4 space-y-2">
          {#each item.dropdownItems as subItem}
            <a href={subItem.path} class="block px-3 py-1.5 text-xs rounded-none transition-all duration-300 {activePath === subItem.path ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent hover:bg-muted'}">
              {subItem.name}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
