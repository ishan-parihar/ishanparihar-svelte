<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let { className = '', disabled = false, children } = $props<{ 
    className?: string; 
    disabled?: boolean;
    children?: any;
  }>();

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
    onmouseenter={handleMouseenter}
    onmouseleave={handleMouseleave}
    onmousedown={handleMousedown}
    onmouseup={handleMouseup}
    onclick={() => {}}
    role="button"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') {/* Handle click */} }}
    tabindex="0"
  >
  {@render children?.()}
</div>
