<script lang="ts">
  import { page } from '$app/stores';
  import { navigationItems } from '$lib/config/navigation';

  const pathname = $page.url.pathname;
</script>

<div class="flex flex-col space-y-3 items-center">
  {#each navigationItems as item}
    <div class="w-full">
      <a
        href={item.path}
        data-active={pathname === item.path || (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.path))}
        class="relative px-3 py-1.5 text-sm font-bold transition-all duration-300 rounded-none block w-full text-center transform hover:scale-105 {pathname === item.path || (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.path)) ? 'text-accent bg-accent/10 scale-105' : 'text-foreground hover:text-accent hover:bg-muted'}"
        aria-current={pathname === item.path ? 'page' : undefined}
      >
        <span>
          {item.name}
        </span>
      </a>

      {#if item.hasDropdown && item.dropdownItems}
        <div class="mt-2 ml-4 space-y-2">
          {#each item.dropdownItems as subItem}
            <a
              href={subItem.path}
              class="block px-3 py-1.5 text-xs rounded-none transition-all duration-300 {pathname === subItem.path ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent hover:bg-muted'}"
            >
              {subItem.name}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
