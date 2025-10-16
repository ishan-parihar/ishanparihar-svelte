<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let className = '';
  export let disabled = false;

  const scale = tweened(1, { duration: 200, easing: cubicOut });
  const y = tweened(0, { duration: 200, easing: cubicOut });

  function handleMouseenter() {
    if (!disabled) {
      scale.set(1.03);
      y.set(-2);
    }
  }

  function handleMouseleave() {
    if (!disabled) {
      scale.set(1);
      y.set(0);
    }
  }

  function handleMousedown() {
    if (!disabled) {
      scale.set(0.995);
      y.set(0);
    }
  }

  function handleMouseup() {
    if (!disabled) {
      scale.set(1.03);
      y.set(-2);
    }
  }
</script>

<div
  class="{className} {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
  style="transform: scale({$scale}) translateY({$y}px);"
  on:mouseenter={handleMouseenter}
  on:mouseleave={handleMouseleave}
  on:mousedown={handleMousedown}
  on:mouseup={handleMouseup}
  on:click
>
  <slot />
</div>
