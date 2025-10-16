<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  export let className = '';
  export let staggerDelay = 0.1;

  let element: HTMLElement;
  let isInView = false;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isInView = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  });

  function staggeredFly(node: HTMLElement, { delay = 0, ...params }) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      delay,
      css: (t: number) => `
        ${transform} translate(0, ${fly(node, params).css(t).transform.split(',')[5].slice(0, -1)}px);
        opacity: ${fly(node, params).css(t).opacity};
      `,
    };
  }
</script>

<div bind:this={element} class="{className}">
  {#if isInView}
    <slot staggerDelay={staggerDelay} />
  {/if}
</div>
