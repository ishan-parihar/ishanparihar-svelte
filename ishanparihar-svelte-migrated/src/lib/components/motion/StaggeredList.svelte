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

    // Calculate the fly animation parameters
    const flyParams = { ...params };
    const y = flyParams.y || 50; // Default to 50px if not specified
    const opacity = flyParams.opacity !== undefined ? flyParams.opacity : 0; // Default to 0 if not specified
    const duration = flyParams.duration || 400; // Default to 400ms if not specified
    const easing = flyParams.easing || "cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // Default easing

    return {
      delay,
      css: (t: number) => `
        ${transform} translate(0, ${(1 - t) * y}px);
        opacity: ${t * (1 - opacity) + opacity};
      `,
      duration,
      easing
    };
  }
</script>

<div bind:this={element} class="{className}">
  {#if isInView}
    <slot staggerDelay={staggerDelay} />
  {/if}
</div>
