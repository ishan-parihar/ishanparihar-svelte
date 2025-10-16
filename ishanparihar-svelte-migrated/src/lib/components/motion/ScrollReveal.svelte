<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  export let scrollContainer: HTMLElement | null = null;
  export let enableBlur = true;
  export let baseOpacity = 0.1;
  export let baseRotation = 3;
  export let blurStrength = 4;
  export let containerClassName = '';
  export let textClassName = '';
  export let rotationEnd = 'bottom bottom';
  export let wordAnimationEnd = 'bottom bottom';

  let container: HTMLElement;
  let words: string[] = [];

  // This is a simplified version of the children processing
  // In a real-world scenario, you would need to handle different types of children
  export let text: string;

  onMount(() => {
    words = text.split(/(\s+)/);

    const el = container;
    if (!el) return;

    const scroller = scrollContainer || window;

    gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      {
        ease: 'none',
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom',
          end: rotationEnd,
          scrub: true,
        },
      }
    );

    const wordElements = el.querySelectorAll<HTMLElement>('.word');

    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: 'opacity' },
      {
        ease: 'none',
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom-=20%',
          end: wordAnimationEnd,
          scrub: true,
        },
      }
    );

    if (enableBlur) {
      gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: 'none',
          filter: 'blur(0px)',
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });
</script>

<h2 bind:this={container} class="{containerClassName || 'my-5'}">
  <p class="text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold {textClassName}">
    {#each words as word, i}
      <span class="inline-block word">{word}</span>
    {/each}
  </p>
</h2>
