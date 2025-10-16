<script lang="ts">
  export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let asChild = false;

  let AllClasses: string[] = [];
  // Base styles
  AllClasses.push('inline-flex', 'items-center', 'justify-center', 'rounded-md', 'text-sm', 'font-medium', 'transition-colors', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:pointer-events-none', 'disabled:opacity-50');

  // Variants
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };
  AllClasses.push(variants[variant]);

  // Sizes
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  AllClasses.push(sizes[size]);

  let finalClass = AllClasses.join(' ');

</script>

{#if asChild}
  <slot {finalClass} />
{:else}
  <button class="{finalClass} {$$props.class ?? ''}" on:click {...$$restProps}>
    <slot />
  </button>
{/if}
