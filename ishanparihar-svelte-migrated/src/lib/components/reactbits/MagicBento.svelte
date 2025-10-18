<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    cards = [],
    className = "",
  } = $props();

  let grid: HTMLDivElement;
</script>

<div class="bento-section grid gap-2 p-3 select-none relative" bind:this={grid}>
  <div class={className || "card-responsive grid gap-4"}>
    {#each cards as item (item.id)}
       <div class="card flex flex-col justify-between relative bg-card p-4 md:p-5 rounded-none border border-solid border-border font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5">
         {item.content}
       </div>
    {/each}
  </div>
</div>

<style>
  .bento-section {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    --glow-radius: 200px;
    --glow-color: hsl(var(--primary));
    --border-color: hsl(var(--border));
    --background-dark: hsl(var(--background));
    --white: hsl(var(--foreground));
    --primary-color: hsl(var(--primary));
    --primary-glow: hsl(var(--primary) / 0.2);
    --primary-border: hsl(var(--primary) / 0.8);
  }
</style>
