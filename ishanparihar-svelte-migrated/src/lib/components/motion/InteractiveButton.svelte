<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let {
    className = '',
    onClick,
    disabled = false,
  } = $props();

  const scale = tweened(1, { duration: 200, easing: cubicOut });

  function handleMouseOver() {
    if (!disabled) {
      scale.set(1.05);
    }
  }

  function handleMouseOut() {
    if (!disabled) {
      scale.set(1);
    }
  }

  function handleMouseDown() {
    if (!disabled) {
      scale.set(0.95);
    }
  }

  function handleMouseUp() {
    if (!disabled) {
      scale.set(1.05);
    }
  }
</script>

<button
  class={className}
  {disabled}
  on:click={onClick}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  style="transform: scale({$scale});"
>
  <slot />
</button>