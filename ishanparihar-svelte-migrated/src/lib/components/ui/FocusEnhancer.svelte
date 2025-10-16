<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    intensity = 1,
  } = $props();

  let container: HTMLDivElement;
  let isFocused = false;
  let mouseX = 0.5;
  let mouseY = 0.5;

  onMount(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!container || !isFocused) return;

      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };

    const handleMouseEnter = () => (isFocused = true);
    const handleMouseLeave = () => {
      isFocused = false;
      mouseX = 0.5;
      mouseY = 0.5;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  const rotateX = $derived((mouseY - 0.5) * intensity * -4);
  const rotateY = $derived((mouseX - 0.5) * intensity * 4);
  const glowOpacity = $derived(Math.sin(mouseX * Math.PI) * 0.3);
</script>

<div
  bind:this={container}
  style="perspective: 1000px; transform-style: preserve-3d;"
>
  <div
    style="transform: rotateX({rotateX}deg) rotateY({rotateY}deg); transform-style: preserve-3d;"
  >
    <slot />
    <div
      class="absolute inset-0 rounded-[inherit] pointer-events-none"
      style="background: radial-gradient(600px circle at center, rgba(0, 255, 255, 0.15) 0%, transparent 80%); opacity: {glowOpacity}; transform: translateZ(10px);"
    ></div>
  </div>
</div>