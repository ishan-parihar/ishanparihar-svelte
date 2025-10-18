<script lang="ts">
  import { cn } from '$lib/utils';
  import ShuffleGrid from './ShuffleGrid.svelte';

let {
  title = "Ready to Transform Your Life?",
  subtitle = "Spiritual Growth",
  description = "Take the first step towards a more conscious, purposeful life. Join our community of seekers and discover the tools, guidance, and support you need to unlock your full potential.",
  buttonText = "Schedule a Consultation",
  buttonLink = "/contact",
  onButtonClick,
  rightColumn,
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  rightColumn?: () => any;
} = $props();

  function handleButtonClick() {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  }
</script>

<section class="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
  <div>
    <span class="block mb-4 text-xs md:text-sm text-primary font-medium">
      {subtitle}
    </span>
    <h3 class="text-4xl md:text-6xl font-semibold text-foreground">
      {title}
    </h3>
    <p class="text-base md:text-lg text-muted-foreground my-4 md:my-6">
      {description}
    </p>
     <button
       onclick={handleButtonClick}
       class={cn(
         "bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md",
         "transition-all hover:bg-primary/90 active:scale-95",
         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
       )}
     >
      {buttonText}
    </button>
  </div>
{#if rightColumn}
  {@render rightColumn()}
{:else}
  <ShuffleGrid />
{/if}
</section>