<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let {
    className = '',
    onClick,
    disabled = false,
    children
  } = $props<{
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: () => any;
  }>();

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
   onclick={onClick}
   onmouseover={handleMouseOver}
   onmouseout={handleMouseOut}
   onmousedown={handleMouseDown}
   onmouseup={handleMouseUp}
   onfocus={handleMouseOver}
   onblur={handleMouseOut}
   style="transform: scale({$scale});"
 >
  {@render children?.()}
</button>