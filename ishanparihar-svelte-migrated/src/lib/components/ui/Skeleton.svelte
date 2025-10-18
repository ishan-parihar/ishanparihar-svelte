<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  
  let { className = '', children, ...restProps } = $props<{ 
    className?: string; 
    children?: any;
  } & HTMLAttributes<HTMLDivElement>>();
  export { className as class }
</script>

<div class="animate-pulse rounded-md bg-muted {className}" {...restProps}>
  {@render children?.()}
</div>
