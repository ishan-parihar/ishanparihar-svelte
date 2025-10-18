<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    className,
    href = '/',
    size = 'md',
    variant = 'default',
  }: {
    className?: string;
    href?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'signature';
  } = $props();

  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl',
  };

  const logoText = 'Ishan Parihar';

  const logoClasses = cn(
    'font-logo transition-all duration-300 text-foreground',
    sizeClasses[size],
    variant === 'signature' && 'text-primary',
    'hover:text-primary',
    className
  );
</script>

{#if href}
  <a {href} class="inline-block group">
    <span class={logoClasses}>{logoText}</span>
  </a>
{:else}
  <span class={logoClasses}>{logoText}</span>
{/if}
