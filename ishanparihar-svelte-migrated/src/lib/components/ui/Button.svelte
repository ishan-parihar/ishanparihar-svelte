<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  type Size = 'default' | 'sm' | 'lg' | 'icon';

  let { 
    variant = 'default' as Variant,
    size = 'default' as Size, 
    asChild = false,
    children = '',
    ...restProps
  } = $props<{ 
    variant?: Variant;
    size?: Size;
    asChild?: boolean;
    children?: string | (() => any);
    class?: string;
  } & HTMLButtonAttributes>();

  // Define variants and sizes with proper typing
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  } as const;
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  } as const;

  // Calculate the final class string using $derived
  const finalClass = $derived([
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    variants[variant as Variant],
    sizes[size as Size],
    restProps.class || ''
  ].filter(Boolean).join(' '));

  // Helper function to render child content
  function renderChildren() {
    if (typeof children === 'function') {
      return children();
    }
    return null;
  }
</script>

{#if asChild}
  {@render renderChildren()}
{:else}
  <button class={finalClass} {...restProps}>
    {typeof children === 'function' ? children() : children}
  </button>
{/if}
