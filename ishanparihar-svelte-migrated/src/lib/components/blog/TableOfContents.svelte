<script lang="ts">
  import { onMount } from 'svelte';

  export let headings: { text: string; slug: string; level: number }[] = [];

  let activeId = '';

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.slug);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  });

  function handleClick(event: MouseEvent, slug: string) {
    event.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<div class="toc-container border bg-card rounded-lg overflow-hidden shadow-lg">
  <div class="py-2.5 px-3 flex items-center justify-center border-b border-border toc-header bg-transparent">
    <h3 class="text-sm font-medium text-foreground">Table of Contents</h3>
  </div>
  <div class="py-2 px-2 toc-list bg-transparent max-h-[300px] overflow-y-auto scrollbar-thin">
    {#if headings.length > 0}
      <ul class="space-y-0.5">
        {#each headings as heading}
          <li style="padding-left: {(heading.level - 2) * 0.75}rem" class="text-sm level-{heading.level}">
            <a
              href="#{heading.slug}"
              on:click={(e) => handleClick(e, heading.slug)}
              class="flex items-center gap-0.5 py-1 hover:bg-muted transition-colors w-full text-left px-1.5 rounded-none {activeId === heading.slug ? 'text-foreground font-medium' : 'text-muted-foreground'}"
            >
              <span class="mr-1 {heading.level === 2 ? 'w-1.25 h-1.25' : 'w-1 h-1'} rounded-none bg-foreground/70 inline-block flex-shrink-0"></span>
              <span class="heading-text">{heading.text}</span>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="text-center py-2 text-sm text-muted-foreground">No headings found</div>
    {/if}
  </div>
</div>
